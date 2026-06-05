import { PartialBlock } from "@blocknote/core";
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

export const getDefaultBlockGroupMeta = (
  blockGroupId: UUID,
  blockPackId: UUID,
  prevBlockGroupId: UUID | null = null,
  syncBlockGroupId: UUID | null = null,
  rawArborizedEditableBlock: PartialBlock = {}
): BlockGroupMeta => ({
  id: blockGroupId,
  blockPackId: blockPackId,
  prevBlockGroupId: prevBlockGroupId,
  syncBlockGroupId: syncBlockGroupId,
  size: 0,
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  rawArborizedEditableBlock: rawArborizedEditableBlock,
});
