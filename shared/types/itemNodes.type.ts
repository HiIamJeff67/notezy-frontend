import { MaterialType } from "@shared/enums/materialType.enum";
import { SupportedBlockPackIcon } from "@shared/enums/supportedBlockPackIcon.enum";
import { UUID } from "crypto";

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
  nodeType: "MATERIAL";
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
  nodeType: "BLOCK_PACK";
}
