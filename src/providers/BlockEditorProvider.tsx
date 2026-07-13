import { BlockNoteEditor } from "@blocknote/core";
import { RealtimePermission } from "@shared/api/interfaces/enums";
import {
  getNotezyBlockNoteXmlFragment,
  NotezyBlockPackEditor,
} from "@shared/blockpack/core";
import { randomColor } from "@shared/util/random";
import { createContext, useEffect, useMemo } from "react";
import type * as Y from "yjs";
import { useUser } from "@/hooks/useUser";
import { useBlockPackRealtimeChannel } from "@/providers/RealtimeProvider";
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
  const channel = useBlockPackRealtimeChannel(
    blockPackMeta.id,
    RealtimePermission.Write
  );

  const editor = useMemo(
    () =>
      NotezyBlockPackEditor.create({
        collaboration: {
          fragment: getNotezyBlockNoteXmlFragment(
            channel.doc
          ) as Y.XmlFragment,
          provider: channel.provider,
          user: {
            name: userData?.displayName ?? userData?.name ?? "Notezy User",
            color: randomColor(),
          },
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
  }, [channel.permission, channel.status, editor]);

  return (
    <BlockEditorContext.Provider value={{ editor, state }}>
      {children}
    </BlockEditorContext.Provider>
  );
};
