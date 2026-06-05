import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";

export interface MaterialMeta {
  id: UUID;
  parentId: UUID;
  rootId: UUID;
  name: string;
  size: number;
  contentType: string;
  parseMediaType: string;
  downloadURL: string | null;
  path: UUID[];
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export const getDefaultMaterialMeta = (
  materialId: UUID,
  parentSubShelfId: UUID,
  rootShelfId: UUID = generateUUID()
): MaterialMeta => ({
  id: materialId,
  parentId: parentSubShelfId,
  rootId: rootShelfId,
  name: "Untitled",
  size: 0,
  contentType: "text/plain",
  parseMediaType: "",
  downloadURL: null,
  path: [],
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
});
