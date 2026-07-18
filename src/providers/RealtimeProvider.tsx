import {
  RealtimePermission,
  RealtimePermissionSchema,
} from "@shared/api/interfaces/enums";
import {
  mutationFnCreateMyBlockPackChannelTicket,
  mutationFnCreateMyRealtimeConnectionTicket,
} from "@shared/api/invokers/realtime.invoker";
import {
  RealtimeBinaryFrameType,
  RealtimeClient,
  type RealtimeBlockPackChannelStatus,
  type RealtimeConnectionState,
} from "@shared/api/websocket";
import { RealtimeYjsProvider } from "@shared/blockpack/core";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import type { z } from "zod";
import { useNetwork, useUser } from "@/hooks";

export type RealtimeBlockPackChannel = {
  blockPackId: UUID;
  permission: z.infer<typeof RealtimePermissionSchema>;
  status: RealtimeBlockPackChannelStatus;
  connectorChannelId: number | null;
  doc: Y.Doc;
  provider: RealtimeYjsProvider;
  error: string | null;
};

type RealtimeChannelStore = RealtimeBlockPackChannel & {
  retainCount: number;
};

type RealtimeContextType = {
  rootState: RealtimeConnectionState;
  connectionId: string | null;
  version: number;
  getOrCreateBlockPackChannel: (
    blockPackId: UUID,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => RealtimeBlockPackChannel;
  retainBlockPackChannel: (
    blockPackId: UUID,
    permission: z.infer<typeof RealtimePermissionSchema>
  ) => RealtimeBlockPackChannel;
  releaseBlockPackChannel: (blockPackId: UUID) => void;
  getBlockPackChannel: (blockPackId: UUID) => RealtimeBlockPackChannel | null;
};

export const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
);

export const RealtimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userData } = useUser();
  const { isOnline } = useNetwork();
  const clientRef = useRef<RealtimeClient | null>(null);
  const channelsRef = useRef<Map<UUID, RealtimeChannelStore>>(new Map());
  const [rootState, setRootState] = useState<RealtimeConnectionState>("idle");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const rerender = useCallback(() => setVersion(value => value + 1), []);

  const getRequestHeader = useCallback(() => {
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    return {
      userAgent: navigator.userAgent,
      authorization: getAuthorization(accessToken),
    };
  }, []);

  const setChannelStatus = useCallback(
    (blockPackId: string, status: RealtimeBlockPackChannelStatus) => {
      const channel = channelsRef.current.get(blockPackId as UUID);
      if (!channel) return;
      channel.status = status;
      if (status !== "error") channel.error = null;
      if (status === "idle" || status === "unsubscribed") {
        channel.connectorChannelId = null;
        channel.provider.disconnect();
      }
      rerender();
    },
    [rerender]
  );

  const flushAllBlockPackDocumentUpdates = useCallback(() => {
    for (const channel of channelsRef.current.values()) {
      channel.provider.flushPendingDocumentUpdatesNow();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushAllBlockPackDocumentUpdates();
      }
    };

    window.addEventListener("pagehide", flushAllBlockPackDocumentUpdates);
    window.addEventListener("beforeunload", flushAllBlockPackDocumentUpdates);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushAllBlockPackDocumentUpdates);
      window.removeEventListener(
        "beforeunload",
        flushAllBlockPackDocumentUpdates
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushAllBlockPackDocumentUpdates]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!userData || !isOnline) {
      clientRef.current?.stop();
      clientRef.current = null;
      setRootState("idle");
      setConnectionId(null);
      for (const channel of channelsRef.current.values()) {
        channel.connectorChannelId = null;
        channel.status = "idle";
        channel.provider.disconnect();
      }
      rerender();
      return;
    }

    if (clientRef.current) return;

    const client = new RealtimeClient({
      getConnectionTicket: async () => {
        const response = await mutationFnCreateMyRealtimeConnectionTicket({
          header: getRequestHeader(),
          body: {},
        });
        return response.data;
      },
      getBlockPackChannelTicket: async (blockPackId, permission) => {
        const response = await mutationFnCreateMyBlockPackChannelTicket({
          header: getRequestHeader(),
          body: {
            blockPackId,
            permission,
          },
        });
        return response.data;
      },
      onState: setRootState,
      onReady: nextConnectionId => {
        setConnectionId(nextConnectionId);
      },
      onChannelStatus: setChannelStatus,
      onChannelSubscribed: (blockPackId, frame, permission) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;
        channel.connectorChannelId = frame.connectorChannelId;
        channel.permission = permission;
        channel.provider.setReadOnly(permission === RealtimePermission.Read);
        channel.provider.connect((type, payload) => {
          client.sendBlockPackBinary(blockPackId, type, payload);
        });
        rerender();
      },
      onChannelBinary: (blockPackId, frame) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;
        if (frame.type === RealtimeBinaryFrameType.YjsDocument) {
          channel.provider.applyDocumentUpdate(frame.payload);
        } else if (frame.type === RealtimeBinaryFrameType.Awareness) {
          channel.provider.applyAwarenessUpdate(frame.payload);
        }
      },
      onChannelError: (blockPackId, frame) => {
        const channel = channelsRef.current.get(blockPackId as UUID);
        if (!channel) return;

        channel.error = frame.message;
        channel.connectorChannelId = null;
        channel.provider.disconnect();
        if (frame.code === "permission_revoked") {
          channel.permission = RealtimePermission.Read;
          channel.provider.setReadOnly(true);
          toast.error("BlockPack permission changed. Editing is now read-only.");
        } else if (frame.code === "resource_unavailable") {
          channel.provider.setReadOnly(true);
          toast.error("This BlockPack is no longer available.");
        } else if (frame.code === "resync_required") {
          channel.provider.setReadOnly(true);
          toast.error("Realtime document needs a resync. Please reopen it.");
        } else {
          toast.error(frame.message);
        }
        rerender();
      },
      onError: error => {
        console.error("[Realtime]", error);
      },
    });

    clientRef.current = client;
    client.start();
    for (const channel of channelsRef.current.values()) {
      client.registerBlockPackChannel(channel.blockPackId, channel.permission);
    }

    return () => {
      if (clientRef.current === client) {
        client.stop();
        clientRef.current = null;
      }
    };
  }, [getRequestHeader, isOnline, rerender, setChannelStatus, userData]);

  const getOrCreateBlockPackChannel = useCallback(
    (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>
    ) => {
      let channel = channelsRef.current.get(blockPackId);
      if (!channel) {
        const doc = new Y.Doc();
        const provider = new RealtimeYjsProvider(doc);
        provider.setReadOnly(permission === RealtimePermission.Read);
        channel = {
          blockPackId,
          permission,
          status: "idle",
          connectorChannelId: null,
          doc,
          provider,
          error: null,
          retainCount: 0,
        };
        channelsRef.current.set(blockPackId, channel);
      }

      channel.permission = permission;
      channel.provider.setReadOnly(permission === RealtimePermission.Read);
      return channel;
    },
    []
  );

  const retainBlockPackChannel = useCallback(
    (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>
    ) => {
      const channel = getOrCreateBlockPackChannel(blockPackId, permission);
      channel.retainCount += 1;
      clientRef.current?.registerBlockPackChannel(blockPackId, permission);
      return channel;
    },
    [getOrCreateBlockPackChannel]
  );

  const releaseBlockPackChannel = useCallback(
    (blockPackId: UUID) => {
      const channel = channelsRef.current.get(blockPackId);
      if (!channel) return;
      channel.retainCount -= 1;
      if (channel.retainCount > 0) return;

      channel.provider.flushPendingDocumentUpdatesNow();
      channel.provider.destroy();
      clientRef.current?.unregisterBlockPackChannel(blockPackId);
      channel.doc.destroy();
      channelsRef.current.delete(blockPackId);
      rerender();
    },
    [rerender]
  );

  const getBlockPackChannel = useCallback((blockPackId: UUID) => {
    return channelsRef.current.get(blockPackId) ?? null;
  }, []);

  const value = useMemo<RealtimeContextType>(
    () => ({
      rootState,
      connectionId,
      version,
      getOrCreateBlockPackChannel,
      retainBlockPackChannel,
      releaseBlockPackChannel,
      getBlockPackChannel,
    }),
    [
      connectionId,
      getBlockPackChannel,
      getOrCreateBlockPackChannel,
      releaseBlockPackChannel,
      retainBlockPackChannel,
      rootState,
      version,
    ]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context)
    throw new Error("useRealtime must be used within RealtimeProvider");
  return context;
};

export const useBlockPackRealtimeChannel = (
  blockPackId: UUID,
  permission: z.infer<typeof RealtimePermissionSchema>
) => {
  const {
    getOrCreateBlockPackChannel,
    retainBlockPackChannel,
    releaseBlockPackChannel,
    getBlockPackChannel,
  } = useRealtime();
  const channel = getOrCreateBlockPackChannel(blockPackId, permission);

  useEffect(() => {
    const retainedBlockPackId = blockPackId;
    retainBlockPackChannel(blockPackId, permission);
    return () => {
      releaseBlockPackChannel(retainedBlockPackId);
    };
  }, [
    blockPackId,
    permission,
    releaseBlockPackChannel,
    retainBlockPackChannel,
  ]);

  return getBlockPackChannel(blockPackId) ?? channel;
};
