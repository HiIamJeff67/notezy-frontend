import { UserStatus } from "@shared/types/enums";
import { PrivateUserSchema, UserDataSchema } from "@shared/types/models";
import { z } from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== GetUserDate Context ============================== */

export const GetUserDataRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
});

export type GetUserDataRequest = z.infer<typeof GetUserDataRequestSchema>;

export const GetUserDataResponseSchema = NotezyResponseSchema.extend({
  data: UserDataSchema,
});

export type GetUserDataResponse = z.infer<typeof GetUserDataResponseSchema>;

/* ============================== GetMe Context ============================== */

export const GetMeRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
});

export type GetMeRequest = z.infer<typeof GetMeRequestSchema>;

export const GetMeResponseSchema = NotezyResponseSchema.extend({
  data: PrivateUserSchema,
});

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

/* ============================== UpdateMe Context ============================== */

export const UpdateMeRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    values: z
      .object({
        displayName: z
          .string()
          .min(6)
          .max(32)
          .regex(/^[0-9]+/),
        status: z.enum(UserStatus),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMeRequest = z.infer<typeof UpdateMeRequestSchema>;

export const UpdateMeResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMeResponse = z.infer<typeof UpdateMeResponseSchema>;
