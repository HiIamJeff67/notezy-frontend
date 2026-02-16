import { PartialBlock } from "@blocknote/core";
import { UUID } from "crypto";

export interface BlockGroupMeta {
  id: UUID;
  blockPackId: UUID;
  prevBlockGroupId: UUID | null;
  syncBlockGroupId: UUID | null;
  size: number;
  deletedAt?: Date | null;
  updatedAt?: Date;
  createdAt?: Date;
  block: PartialBlock;
}

export const getDefaultBlockGroupMeta = (
  blockGroupId: UUID,
  blockPackId: UUID,
  prevBlockGroupId: UUID | null = null,
  syncBlockGroupId: UUID | null = null
): BlockGroupMeta => {
  return {
    id: blockGroupId,
    blockPackId: blockPackId,
    prevBlockGroupId: prevBlockGroupId,
    syncBlockGroupId: syncBlockGroupId,
    size: 0,
    deletedAt: undefined,
    updatedAt: undefined,
    createdAt: undefined,
    block: {},
  };
};
