import { z } from "zod";

export function partialUpdateSchemaFactory<T extends z.ZodRawShape>(
  fieldsSchema: z.ZodObject<T>
) {
  return z.object({
    values: fieldsSchema.partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  });
}
