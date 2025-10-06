import { MaterialType } from "@shared/types/enums";
import { UUID } from "crypto";

/**
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
  updatedAt: Date;
  createdAt: Date;

  isOpen: boolean;
}

export interface SubShelfNode {
  id: UUID;
  rootShelfId: UUID;
  prevSubShelfId: UUID | null;
  name: string;
  path: UUID[];
  updatedAt: Date;
  createdAt: Date;

  isExpanded: boolean; // to indicate whether the data below this sub shelf is fetched or not
  children: Record<UUID, SubShelfNode>;
  materialNodes: Record<UUID, MaterialNode>;

  // to indicate this sub shelf is currently open and available to see things below it,
  // which means even if the data is fetched, the user can still toggle this value for frontend display
  isOpen: boolean;
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
  isOpen: boolean;
}
