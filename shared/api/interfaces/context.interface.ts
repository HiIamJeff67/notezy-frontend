import { NotezyExceptionSchema } from "@shared/api/exceptions";
import { z } from "zod";

export const NotezyRequestSchema = z.object({
  header: z.object({}).optional(),
  // contextFields: z.object({}).optional(), // this field is only exist in the backend
  body: z.object({}).optional(),
  param: z.object({}).optional(),
  affected: z.object({}).optional(), // this field is only exist in the frontend(for cache strategy)
});

export type NotezyRequest = z.infer<typeof NotezyRequestSchema>;

export const NotezyResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({}).nullable(),
  newAccessToken: z.string().optional(), // exist if the API route is under the refresh access token middleware
  exception: NotezyExceptionSchema.nullable(),
});

export type NotezyResponse = z.infer<typeof NotezyResponseSchema>;
