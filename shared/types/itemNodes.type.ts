import { MaterialType } from "@shared/types/enums/materialType.enum";
import { SupportedBlockPackIcon } from "@shared/types/enums/supportedBlockPackIcon.enum";
import { UUID } from "crypto";

export interface MaterialNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  type: MaterialType;
  megaByteSize: bigint;
  downloadURL: string;
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
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
}
