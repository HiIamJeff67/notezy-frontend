import type { PartialBlock } from "@blocknote/core";
import { SupportedIcon } from "@shared/api/interfaces/enums/supportedIcon.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";

export interface BlockPackMeta {
  id: UUID;
  parentId: UUID;
  rootId: UUID;
  name: string;
  icon: SupportedIcon | null;
  headerBackgroundURL: string | null;
  blockCount: number;
  path: UUID[];
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  blocks: PartialBlock[];
}

export const getDefaultBlockPackMeta = (
  blockPackId: UUID,
  parentSubShelfId: UUID,
  rootShelfId: UUID = generateUUID()
): BlockPackMeta => ({
  id: blockPackId,
  parentId: parentSubShelfId,
  rootId: rootShelfId,
  name: "Untitled",
  icon: null,
  headerBackgroundURL: null,
  blockCount: 0,
  path: [],
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  blocks: [],
});

export type BlockPackMetaAction =
  | {
      type: "init";
      payload: BlockPackMeta;
    }
  | { type: "setName"; newName: string }
  | { type: "setIcon"; newIcon: SupportedIcon }
  | { type: "setHeaderBackgroundURL"; newHeaderBackgroundURL: string }
  | { type: "setBlockCount"; newBlockCount: number }
  | { type: "setUpdatedAt"; newUpdatedAt: Date }
  | { type: "setCreatedAt"; newCreatedAt: Date }
  | { type: "setBlocks"; newBlocks: PartialBlock[] };

export function blockPackMetaReducer(
  state: BlockPackMeta,
  action: BlockPackMetaAction
): BlockPackMeta {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "setName":
      return { ...state, name: action.newName };
    case "setIcon":
      return { ...state, icon: action.newIcon };
    case "setHeaderBackgroundURL":
      return { ...state, headerBackgroundURL: action.newHeaderBackgroundURL };
    case "setBlockCount":
      return { ...state, blockCount: action.newBlockCount };
    case "setUpdatedAt":
      return { ...state, updatedAt: action.newUpdatedAt };
    case "setCreatedAt":
      return { ...state, createdAt: action.newCreatedAt };
    case "setBlocks":
      return { ...state, blocks: action.newBlocks };
    default:
      return state;
  }
}
