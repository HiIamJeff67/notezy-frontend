import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { CountryCode } from "@shared/enums";
import z from "zod";

/* ============================== GetMyAccount Context ============================== */

export const GetMyAccountRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
});

export type GetMyAccountRequest = z.infer<typeof GetMyAccountRequestSchema>;

export const GetMyAccountResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    countryCode: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    googleCredential: z.string().nullable(),
    discordCredential: z.string().nullable(),
    rootShelfCount: z.int32().min(0),
    blockPackCount: z.int32().min(0),
    blockCount: z.int32().min(0),
    materialCount: z.int32().min(0),
    workflowCount: z.int32().min(0),
    additionalItemCount: z.int32().min(0),
    updatedAt: z.coerce.date(),
  }),
});

export type GetMyAccountResponse = z.infer<typeof GetMyAccountResponseSchema>;

/* ============================== UpdateMyAccount Context ============================== */

export const UpdateMyAccountRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
    csrfToken: z.string(),
  }),
  body: z.object({
    authCode: z.string().length(6),
    values: z
      .object({
        countryCode: z.enum(CountryCode).nullable(),
        backupEmail: z.email().nullable(),
        phoneNumber: z.string().min(1).max(15).regex(/^\d+$/).nullable(),
      })
      .partial(),
    setNull: z.record(z.string(), z.boolean()).optional(),
  }),
});

export type UpdateMyAccountRequest = z.infer<
  typeof UpdateMyAccountRequestSchema
>;

export const UpdateMyAccountResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyAccountResponse = z.infer<
  typeof UpdateMyAccountResponseSchema
>;

/* ============================== BindGoogleAccount Context ============================== */

export const BindGoogleAccountRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    authorizationCode: z.string(),
  }),
});

export type BindGoogleAccountRequest = z.infer<
  typeof BindGoogleAccountRequestSchema
>;

export const BindGoogleAccountResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type BindGoogleAccountResponse = z.infer<
  typeof BindGoogleAccountResponseSchema
>;

/* ============================== UnbindGoogleAccount Context ============================== */

export const UnbindGoogleAccountRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    authorizationCode: z.string(),
  }),
});

export type UnbindGoogleAccountRequest = z.infer<
  typeof UnbindGoogleAccountRequestSchema
>;

export const UnbindGoogleAccountResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UnbindGoogleAccountResponse = z.infer<
  typeof UnbindGoogleAccountResponseSchema
>;
