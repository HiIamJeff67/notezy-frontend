import { MaterialContentType, MaterialType } from "@shared/types/enums";
import { UUID } from "crypto";

/**
 * Since the Backend is using upper case letter as the field name,
 * so we are forced to use it as well
 * Note that we don't implement the deletedAt field here,
 *           since if the node is deleted, it should be put in the trash can
 *           in the frontend scenario
 */

export interface MaterialNode {
  id: UUID;
  parentSubShelfId: UUID;
  name: string;
  type: MaterialType;
  downloadURL: string;
  contentType: MaterialContentType;
  parseMediaType: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface SubShelfNode {
  id: UUID;
  rootShelfId: UUID;
  prevSubShelfId: UUID | null;
  name: string;
  path: UUID[];
  updatedAt: Date;
  createdAt: Date;

  isExpanded: boolean;
  children: Record<UUID, SubShelfNode>;
  materialNodes: Record<UUID, MaterialNode>;
}

export interface RootShelfNode {
  id: UUID;
  name: string;
  totalShelfNodes: number;
  totalMaterials: number;
  lastAnalyzedAt: Date;
  updatedAt: Date;
  createdAt: Date;

  isExpanded: boolean;
  children: Record<UUID, SubShelfNode>;
}

export enum AnalysisStatus {
  Explored = "Explored",
  OnlySubShelves = "OnlySubShelves",
  OnlyMaterials = "OnlyMaterials",
  Unexplored = "Unexplored",
}

// This shelf summary structure maybe different from the backend,
// Since we may require more information for the client user
export interface ShelfTreeSummary {
  root: RootShelfNode;
  estimatedByteSize: number;
  maxWidth: number;
  maxDepth: number;
  hasChanged: boolean;
  analysisStatus: AnalysisStatus;
  uniqueMaterialIds: UUID[];
}
