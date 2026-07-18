import type { UUID } from "crypto";

export const NOTEZY_BLOCK_PACK_CHANNEL_TYPE = "BlockPack";
export const NOTEZY_BLOCKNOTE_DOCUMENT_SCHEMA_ID = "notezy.blocknote";
export const NOTEZY_BLOCKNOTE_DOCUMENT_SCHEMA_VERSION = 1 as const;
export const NOTEZY_BLOCKNOTE_YJS_FRAGMENT_NAME = "document-store";
export const NOTEZY_REALTIME_YJS_REMOTE_ORIGIN = Symbol(
  "notezy-realtime-remote"
);
export const NOTEZY_REALTIME_YJS_LOCAL_AWARENESS_REMOVAL_ORIGIN = Symbol(
  "notezy-awareness-local-removal"
);
export const NOTEZY_REALTIME_YJS_DOCUMENT_DEBOUNCE_MS = 100;

export const getNotezyBlockPackRoomName = (blockPackId: UUID | string) =>
  `block-pack:${blockPackId}`;

export const getNotezyBlockNoteXmlFragment = <
  TDoc extends { getXmlFragment: (name: string) => unknown },
>(
  doc: TDoc
) => doc.getXmlFragment(NOTEZY_BLOCKNOTE_YJS_FRAGMENT_NAME);
