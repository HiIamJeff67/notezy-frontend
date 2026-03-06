import {
  NotezyRequestSchema,
  NotezyResponseSchema,
} from "@shared/api/interfaces/context.interface";
import { CountryCode } from "@shared/enums";
import z from "zod";

/* ============================== UpdateMyAccount Context ============================== */

export const UpdateMyAccountRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
  }),
  body: z.object({
    authCode: z.string().length(6),
    values: z.object({
      countryCode: z.enum(CountryCode).nullable(),
      backupEmail: z.email().nullable(),
      phoneNumber: z.number().nullable(),
    }),
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
