import { SupportedBlockPackIcon } from "@shared/enums/supportedBlockPackIcon.enum";
import { BlockGroupMeta } from "@shared/types/blockGroupMeta.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";

export interface BlockPackMeta {
  id: UUID;
  parentId: UUID;
  rootId: UUID;
  name: string;
  icon: SupportedBlockPackIcon | null;
  headerBackgroundURL: string | null;
  blockCount: number;
  deletedAt?: Date | null;
  updatedAt?: Date;
  createdAt?: Date;
  blockGroups: BlockGroupMeta[];
}

export const getDefaultBlockPackMeta = (
  blockPackId: UUID,
  parentSubShelfId: UUID,
  rootShelfId: UUID = generateUUID()
): BlockPackMeta => {
  return {
    id: blockPackId,
    parentId: parentSubShelfId,
    rootId: rootShelfId,
    name: "Untitled",
    icon: null,
    headerBackgroundURL: null,
    blockCount: 0,
    deletedAt: undefined,
    updatedAt: undefined,
    createdAt: undefined,
    blockGroups: [],
  };
};
