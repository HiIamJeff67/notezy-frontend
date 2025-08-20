import { UUID } from "../uuid_v4.type";

export type PrivateShelf = {
  id: UUID;
  name: string;
  encodedStructure: Uint8Array;
  encodedStructureByteSize: number;
  totalShelfNodes: number;
  totalMaterials: number;
  maxWidth: number;
  maxDepth: number;
  updatedAt: Date;
  createdAt: Date;
};
