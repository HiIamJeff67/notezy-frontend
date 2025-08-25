import { partialUpdateSchemaFactory } from "@shared/lib/zodSchemaFactories";
import { z } from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== CreateShelf ============================== */

export const CreateShelfRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    name: z.string().min(1).max(128),
  }),
});

export type CreateShelfRequest = z.infer<typeof CreateShelfRequestSchema>;

export const CreateShelfResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    encodedStructure: z.base64(),
    createdAt: z.coerce.date(),
  }),
});

export type CreateShelfResponse = z.infer<typeof CreateShelfResponseSchema>;

/* ============================== SynchronizeShelves Context ============================== */

export const SynchronizeShelvesRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    shelfIds: z.array(z.uuid("v4")),
    partialUpdates: z.array(
      partialUpdateSchemaFactory(
        z.object({
          name: z.string().min(1).max(128),
          encodedStructure: z.base64(),
        })
      )
    ),
  }),
});

export type SynchronizeShelvesRequest = z.infer<
  typeof SynchronizeShelvesRequestSchema
>;

export const SynchronizeShelvesResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type SynchronizeShelvesResponse = z.infer<
  typeof SynchronizeShelvesResponseSchema
>;
