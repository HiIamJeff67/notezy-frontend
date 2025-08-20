import { z } from "zod";
import {
  AllCountries,
  AllUserGenders,
  AllUserPlans,
  AllUserRoles,
  AllUserStatus,
  Country,
  UserGender,
  UserPlan,
  UserRole,
  UserStatus,
} from "../enums";

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
  name: z.string().min(6).max(16),
  displayName: z.string().min(6).max(32),
  email: z.string().email(),
  role: z.enum(AllUserRoles),
  plan: z.enum(AllUserPlans),
  status: z.enum(AllUserStatus),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export type PrivateUser = z.infer<typeof PrivateUserSchema>;

export const PrivateUserInfoSchema = z.object({
  avatarURL: z.string().url().nullable(),
  coverBackgroundURL: z.string().url().nullable(),
  header: z.string().min(0).max(64).nullable(),
  introduction: z.string().min(0).max(256).nullable(),
  gender: z.enum(AllUserGenders),
  country: z.enum(AllCountries).nullable(),
  birthDate: z.date(),
  updatedAt: z.date(),
});

export type PrivateUserInfo = z.infer<typeof PrivateUserInfoSchema>;
