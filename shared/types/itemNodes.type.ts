import { SupportedBlockPackIcon } from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";

export type ItemType = "BlockPack" | "Material";

export interface MaterialNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  size: number;
  contentType: string;
  parseMediaType: string;
  downloadURL: string | null;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
  nodeType: "Material";
}

export interface BlockPackNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  icon: SupportedBlockPackIcon | null;
  headerBackgroundURL: string | null;
  blockCount: number;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
  nodeType: "BlockPack";
}
