import { SupportedIcon } from "@shared/api/interfaces/enums";
import { BlockGroupMeta } from "@shared/types/blockGroupMeta.type";
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
  blockGroups: BlockGroupMeta[];
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
  blockGroups: [],
});
