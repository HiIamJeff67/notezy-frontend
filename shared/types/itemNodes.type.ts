import {
  MaterialType,
  SupportedBlockPackIcon,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";

export type ItemType = "BlockPack" | "Material";

export interface MaterialNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  type: MaterialType;
  size: bigint;
  downloadURL: string;
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
