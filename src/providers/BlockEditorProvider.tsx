import { BlockNoteEditor } from "@blocknote/core";
import {
  AccessControlPermission,
  RealtimePermission,
} from "@shared/api/interfaces/enums";
import {
  getNotezyBlockNoteXmlFragment,
  NotezyBlockPackEditor,
} from "@shared/blockpack/core";
import { WebURLPathDictionary } from "@shared/constants";
import { randomColor } from "@shared/util/random";
import { createContext, useEffect, useMemo } from "react";
import type * as Y from "yjs";
import { useAppRouterActions } from "@/hooks/useAppRouter";
import { useBlockPackRealtimeChannel } from "@/hooks/useRealtime";
import { useUser } from "@/hooks/useUser";
import { BlockPackMeta } from "@/reducers/blockPackMeta.reducer";

interface BlockEditorContextType {
  editor: BlockNoteEditor<any, any, any>;
  state: BlockEditorState;
}

export const BlockEditorContext = createContext<
  BlockEditorContextType | undefined
>(undefined);

interface BlockEditorProviderProps {
  children: React.ReactNode;
  blockPackMeta: BlockPackMeta;
}

export type BlockEditorState =
  | "initializing"
  | "connecting"
  | "subscribing"
  | "ready"
  | "readOnly"
  | "syncError";

export const BlockEditorProvider = ({
  children,
  blockPackMeta,
}: BlockEditorProviderProps) => {
  const { userData } = useUser();
  const router = useAppRouterActions();
  const requestedRealtimePermission =
    blockPackMeta.permission === AccessControlPermission.Read
      ? RealtimePermission.Read
      : RealtimePermission.Write;
  const channel = useBlockPackRealtimeChannel(
    blockPackMeta.id,
    requestedRealtimePermission
  );

  const editor = useMemo(
    () =>
      NotezyBlockPackEditor.create({
        collaboration: {
          fragment: getNotezyBlockNoteXmlFragment(channel.doc) as Y.XmlFragment,
          provider: channel.provider,
          user: {
            name: userData?.displayName ?? userData?.name ?? "Notezy User",
            publicId: userData?.publicId,
            color: randomColor(),
          } as { name: string; color: string },
          showCursorLabels: "activity",
        },
        trailingBlock: false,
      }),
    [blockPackMeta.id, channel.doc, channel.provider, userData]
  );

  const state: BlockEditorState =
    channel.status === "ticketing" || channel.status === "subscribing"
      ? "subscribing"
      : channel.status === "subscribed"
        ? "ready"
        : channel.status === "readOnly"
          ? "readOnly"
          : channel.status === "error"
            ? "syncError"
            : "connecting";

  useEffect(() => {
    editor.isEditable =
      channel.permission === RealtimePermission.Write &&
      channel.status !== "readOnly" &&
      channel.status !== "error";
    if (import.meta.env.DEV) {
      console.debug("[BlockEditorProvider] editor realtime state", {
        blockPackId: blockPackMeta.id,
        accessPermission: blockPackMeta.permission,
        requestedRealtimePermission,
        channelPermission: channel.permission,
        channelStatus: channel.status,
        isEditable: editor.isEditable,
      });
    }
  }, [
    blockPackMeta.id,
    blockPackMeta.permission,
    channel.permission,
    channel.status,
    editor,
    requestedRealtimePermission,
  ]);

  useEffect(() => {
    if (channel.lifecycleErrorCode === null) return;
    window.dispatchEvent(
      new CustomEvent("notezy:block-pack-room-unavailable", {
        detail: {
          rootShelfId: blockPackMeta.rootId,
          blockPackId: blockPackMeta.id,
          reason: channel.lifecycleErrorCode,
        },
      })
    );
    router.replace(WebURLPathDictionary.root.blockPackEditor.index);
  }, [
    blockPackMeta.id,
    blockPackMeta.rootId,
    channel.lifecycleErrorCode,
    router,
  ]);

  return (
    <BlockEditorContext.Provider value={{ editor, state }}>
      {children}
    </BlockEditorContext.Provider>
  );
};
