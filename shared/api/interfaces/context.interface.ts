import { NotezyExceptionSchema } from "@shared/api/exceptions";
import { z } from "zod";

export const NotezyRequestSchema = z.object({
  header: z.object({}).optional(),
  // contextFields: z.object({}).optional(), // this field is only exist in the backend
  body: z.object({}).optional(),
  param: z.object({}).optional(),
});

export type NotezyRequest = z.infer<typeof NotezyRequestSchema>;

export const NotezyResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({}).nullable(),
  exception: NotezyExceptionSchema.nullable(),
});

export type NotezyResponse = z.infer<typeof NotezyResponseSchema>;
