import { PartialBlock } from "@blocknote/core";
import { UUID } from "crypto";

export interface BlockGroupMeta {
  id: UUID;
  blockPackId: UUID;
  prevBlockGroupId: UUID | null;
  syncBlockGroupId: UUID | null;
  size: bigint;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  rawArborizedEditableBlock: PartialBlock;
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
    size: BigInt(0),
    deletedAt: null,
    updatedAt: new Date(),
    createdAt: new Date(),
    rawArborizedEditableBlock: {},
  };
};
