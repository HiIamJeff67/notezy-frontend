import { MaterialContentType, MaterialType } from "@shared/types/enums";
import { UUID } from "crypto";

/**
 * Since the Backend is using upper case letter as the field name,
 * so we are forced to use it as well
 */

export interface MaterialNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  type: MaterialType;
  downloadURL: string;
  contentType: MaterialContentType;
  parseMediaType: string;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface SubShelfNode {
  id: UUID;
  rootShelfId: UUID;
  prevSubShelfId: UUID | null;
  name: string;
  path: UUID[];
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  children: Record<UUID, SubShelfNode>;
  materialNodes: Record<UUID, MaterialNode>;
}

export interface RootShelfNode {
  id: UUID;
  name: string;
  totalShelfNodes: number;
  totalMaterials: number;
  lastAnalyzedAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  children: Record<UUID, SubShelfNode>;
}
