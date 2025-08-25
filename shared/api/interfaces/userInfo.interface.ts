import { partialUpdateSchemaFactory } from "@shared/lib/zodSchemaFactories";
import { Country, UserGender } from "@shared/types/enums";
import { PrivateUserInfoSchema } from "@shared/types/models";
import { z } from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== GetMyInfo Context ============================== */

export const GetMyInfoRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
});

export type GetMyInfoRequest = z.infer<typeof GetMyInfoRequestSchema>;

export const GetMyInfoResponseSchema = NotezyResponseSchema.extend({
  data: PrivateUserInfoSchema,
});

export type GetMyInfoResponse = z.infer<typeof GetMyInfoResponseSchema>;

/* ============================== UpdateMyInfo Context ============================== */

export const UpdateMyInfoRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: partialUpdateSchemaFactory(
    z.object({
      avatarURL: z.url().nullable(),
      coverBackgroundURL: z.url().nullable(),
      header: z.string().min(0).max(64).nullable(),
      introduction: z.string().min(0).max(256).nullable(),
      gender: z.enum(UserGender),
      country: z.enum(Country).nullable(),
      birthDate: z.coerce.date().max(new Date()),
    })
  ),
});

export type UpdateMyInfoRequest = z.infer<typeof UpdateMyInfoRequestSchema>;

export const UpdateMyInfoResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type UpdateMyInfoResponse = z.infer<typeof UpdateMyInfoResponseSchema>;
