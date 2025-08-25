import { z } from "zod";
import { Language, UserPlan, UserRole, UserStatus } from "../enums";

/**
 * This type is the same as the user data cache
 * (or UserDataCache) in the backend redis cache
 */
export const UserDataSchema = z.object({
  publicId: z.string(),
  name: z
    .string()
    .min(6)
    .max(16)
    .regex(/^[a-zA-Z0-9]+/),
  displayName: z
    .string()
    .min(6)
    .max(32)
    .regex(/^[a-zA-Z0-9]+/),
  email: z.email(),
  accessToken: z.string(),
  role: z.enum(UserRole),
  plan: z.enum(UserPlan),
  status: z.enum(UserStatus),
  avatarURL: z.string().nullable(),
  language: z.enum(Language),
  generalSettingCode: z.int64(),
  privacySettingCode: z.int64(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserData = z.infer<typeof UserDataSchema>;
