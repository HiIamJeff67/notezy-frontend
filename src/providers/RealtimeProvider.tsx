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
  type RealtimeBlockPackChannelStatus,
  RealtimeClient,
  type RealtimeConnectionState,
  type RealtimeErrorCode,
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
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import type { z } from "zod";
import { useNetwork } from "@/hooks/useNetwork";
import { useUser } from "@/hooks/useUser";

const RealtimeBlockPackChannelReleaseDelayMs = 250;

export type RealtimeBlockPackChannel = {
  blockPackId: UUID;
  permission: z.infer<typeof RealtimePermissionSchema>;
  status: RealtimeBlockPackChannelStatus;
  connectorChannelId: number | null;
  doc: Y.Doc;
  provider: RealtimeYjsProvider;
  error: string | null;
  lifecycleErrorCode: RealtimeErrorCode | null;
};

type RealtimeChannelStore = RealtimeBlockPackChannel & {
  retainCount: number;
  isDisposed: boolean;
};

export type RealtimeContextType = {
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
  activeBlockPackChannelCount: number;
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
  const releaseTimersRef = useRef<Map<UUID, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const [rootState, setRootState] = useState<RealtimeConnectionState>("idle");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const activeBlockPackChannelCount = Array.from(
    channelsRef.current.values()
  ).filter(channel => channel.retainCount > 0 && !channel.isDisposed).length;

  const rerender = useCallback(() => setVersion(value => value + 1), []);

  const clearReleaseTimer = useCallback((blockPackId: UUID) => {
    const releaseTimer = releaseTimersRef.current.get(blockPackId);
    if (!releaseTimer) return;
    clearTimeout(releaseTimer);
    releaseTimersRef.current.delete(blockPackId);
  }, []);

  const disposeBlockPackChannel = useCallback(
    (channel: RealtimeChannelStore) => {
      if (channel.isDisposed) return;
      clearReleaseTimer(channel.blockPackId);
      channel.provider.setReadOnly(true);
      channel.provider.disconnect();
      channel.provider.destroy();
      channel.doc.destroy();
      channel.connectorChannelId = null;
      channel.isDisposed = true;
    },
    [clearReleaseTimer]
  );

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
      for (const releaseTimer of releaseTimersRef.current.values()) {
        clearTimeout(releaseTimer);
      }
      releaseTimersRef.current.clear();
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
        if (import.meta.env.DEV) {
          console.debug("[RealtimeProvider] requesting block pack ticket", {
            blockPackId,
            permission,
          });
        }
        const response = await mutationFnCreateMyBlockPackChannelTicket({
          header: getRequestHeader(),
          body: {
            blockPackId,
            permission,
          },
        });
        if (import.meta.env.DEV) {
          console.debug("[RealtimeProvider] received block pack ticket", {
            blockPackId,
            requestedPermission: permission,
            grantedPermission: response.data.permission,
          });
        }
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
        if (channel.lifecycleErrorCode !== null) return;

        channel.error = frame.message;
        channel.connectorChannelId = null;
        if (frame.code === "permission_revoked") {
          channel.lifecycleErrorCode = frame.code;
          channel.status = "error";
          disposeBlockPackChannel(channel);
          toast.error("BlockPack permission changed. Please reopen it.");
        } else if (frame.code === "resource_unavailable") {
          channel.lifecycleErrorCode = frame.code;
          channel.status = "error";
          disposeBlockPackChannel(channel);
          toast.error("This BlockPack is no longer available.");
        } else if (frame.code === "resync_required") {
          channel.lifecycleErrorCode = frame.code;
          channel.status = "error";
          void channel.provider.flushPendingDocumentUpdatesNow();
          channel.provider.disconnect();
          toast.error("Realtime document needs a resync. Please reopen it.");
        } else {
          channel.provider.disconnect();
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
  }, [
    disposeBlockPackChannel,
    getRequestHeader,
    isOnline,
    rerender,
    setChannelStatus,
    userData,
  ]);

  const getOrCreateBlockPackChannel = useCallback(
    (
      blockPackId: UUID,
      permission: z.infer<typeof RealtimePermissionSchema>
    ) => {
      let channel = channelsRef.current.get(blockPackId);
      if (!channel) {
        const doc = new Y.Doc();
        const provider = new RealtimeYjsProvider(doc, blockPackId);
        provider.setReadOnly(permission === RealtimePermission.Read);
        channel = {
          blockPackId,
          permission,
          status: "idle",
          connectorChannelId: null,
          doc,
          provider,
          error: null,
          lifecycleErrorCode: null,
          retainCount: 0,
          isDisposed: false,
        };
        channelsRef.current.set(blockPackId, channel);
      }

      if (channel.lifecycleErrorCode !== null) return channel;

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
      clearReleaseTimer(blockPackId);
      channel.retainCount += 1;
      if (channel.lifecycleErrorCode === null) {
        clientRef.current?.registerBlockPackChannel(blockPackId, permission);
      }
      rerender();
      return channel;
    },
    [clearReleaseTimer, getOrCreateBlockPackChannel, rerender]
  );

  const releaseBlockPackChannel = useCallback(
    (blockPackId: UUID) => {
      const channel = channelsRef.current.get(blockPackId);
      if (!channel) return;
      channel.retainCount = Math.max(0, channel.retainCount - 1);
      if (channel.retainCount > 0) return;

      clearReleaseTimer(blockPackId);
      const releaseTimer = setTimeout(() => {
        releaseTimersRef.current.delete(blockPackId);
        const latestChannel = channelsRef.current.get(blockPackId);
        if (!latestChannel || latestChannel.retainCount > 0) return;

        if (!latestChannel.isDisposed) {
          latestChannel.provider.flushPendingDocumentUpdatesNow();
          latestChannel.provider.destroy();
          latestChannel.doc.destroy();
        }
        clientRef.current?.unregisterBlockPackChannel(blockPackId);
        channelsRef.current.delete(blockPackId);
        rerender();
      }, RealtimeBlockPackChannelReleaseDelayMs);
      releaseTimersRef.current.set(blockPackId, releaseTimer);
      rerender();
    },
    [clearReleaseTimer, rerender]
  );

  const getBlockPackChannel = useCallback((blockPackId: UUID) => {
    return channelsRef.current.get(blockPackId) ?? null;
  }, []);

  const value = useMemo<RealtimeContextType>(
    () => ({
      rootState,
      connectionId,
      version,
      activeBlockPackChannelCount,
      getOrCreateBlockPackChannel,
      retainBlockPackChannel,
      releaseBlockPackChannel,
      getBlockPackChannel,
    }),
    [
      connectionId,
      activeBlockPackChannelCount,
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
