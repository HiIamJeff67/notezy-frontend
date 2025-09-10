import z from "zod";

export const SimpleSearchParamSchema = z.object({
  query: z.string().optional(),
  limit: z.int32().min(1).optional(),
  offset: z.int32().min(0).optional(),
});

export type SimpleSearchParam = z.infer<typeof SimpleSearchParamSchema>;
