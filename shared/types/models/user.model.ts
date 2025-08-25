import {
  Country,
  UserGender,
  UserPlan,
  UserRole,
  UserStatus,
} from "@shared/types/enums";
import { z } from "zod";

export type PublicUser = {
  publicId: string;
  name: string;
  displayName: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  updatedAt: Date;
  createdAt: Date;
};

export type PublicUserInfo = {
  avatarURL: string;
  coverBackgroundURL: string;
  header: string;
  introduction: string;
  gender: UserGender;
  country: Country;
  birthDate: Date;
};

export const PrivateUserSchema = z.object({
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
  role: z.enum(UserRole),
  plan: z.enum(UserPlan),
  status: z.enum(UserStatus),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export type PrivateUser = z.infer<typeof PrivateUserSchema>;

export const PrivateUserInfoSchema = z.object({
  avatarURL: z.url().nullable(),
  coverBackgroundURL: z.url().nullable(),
  header: z.string().min(0).max(64).nullable(),
  introduction: z.string().min(0).max(256).nullable(),
  gender: z.enum(UserGender),
  country: z.enum(Country).nullable(),
  birthDate: z.date(),
  updatedAt: z.date(),
});

export type PrivateUserInfo = z.infer<typeof PrivateUserInfoSchema>;
