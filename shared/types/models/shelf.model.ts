import { z } from "zod";

export const PrivateShelfSchema = z.object({
  id: z.uuidv4(),
  name: z.string().min(1).max(128),
  encodedStructure: z.base64(),
  encodedStructureByteSize: z.int64(),
  totalShelfNodes: z.int32(),
  totalMaterials: z.int32(),
  maxWidth: z.int32(),
  maxDepth: z.int32(),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export type PrivateShelf = z.infer<typeof PrivateShelfSchema>;
