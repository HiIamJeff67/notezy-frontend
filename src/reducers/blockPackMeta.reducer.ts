import type { PartialBlock } from "@blocknote/core";
import { SupportedIcon } from "@shared/api/interfaces/enums/supportedIcon.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";

export interface BlockGroupMeta {
  id: UUID;
  blockPackId: UUID;
  prevBlockGroupId: UUID | null;
  syncBlockGroupId: UUID | null;
  size: number;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  rawArborizedEditableBlock: PartialBlock;
}

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
  blockGroups: BlockGroupMeta[];
}

export const getDefaultBlockGroupMeta = (
  blockGroupId: UUID,
  blockPackId: UUID,
  prevBlockGroupId: UUID | null = null,
  syncBlockGroupId: UUID | null = null,
  rawArborizedEditableBlock: PartialBlock = {}
): BlockGroupMeta => ({
  id: blockGroupId,
  blockPackId,
  prevBlockGroupId,
  syncBlockGroupId,
  size: 0,
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  rawArborizedEditableBlock,
});

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
  blockGroups: [],
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
  | { type: "setBlockGroupMetas"; newBlockGroupMetas: BlockGroupMeta[] };

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
    case "setBlockGroupMetas":
      return { ...state, blockGroups: action.newBlockGroupMetas };
    default:
      return state;
  }
}
