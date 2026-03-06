import { NotezyException, NotezyExceptionSchema } from "@shared/api/exceptions";
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
  data: z.any(),
  newAccessToken: z.string().optional(), // exist if the API route is under the refresh access token middleware
  newCSRFToken: z.string().optional(),
  exception: NotezyExceptionSchema.nullable(),
});

export type NotezyResponse = z.infer<typeof NotezyResponseSchema>;

export const duplicateResponse = <T>(
  response: NotezyResponse,
  success?: boolean,
  data?: T,
  newAccessToken?: string,
  newCSRFToken?: string,
  exception?: NotezyException | null
): NotezyResponse => {
  return {
    ...response,
    ...(success !== undefined && { success: success }),
    ...(data !== undefined && { data: data }),
    ...(newAccessToken !== undefined && { newAccessToken: newAccessToken }),
    ...(newCSRFToken !== undefined && { newCSRFToken: newCSRFToken }),
    ...(exception !== undefined && { exception: exception }),
  };
};
