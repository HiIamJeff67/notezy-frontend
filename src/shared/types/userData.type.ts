import { Language, UserPlan, UserRole, UserStatus } from "../enums";

/**
 * This type is the same as the user data cache
 * (or UserDataCache) in the backend redis cache
 */
export type UserData = {
  publicId: string;
  name: string;
  displayName: string;
  email: string;
  accessToken: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  // Note: avatarURL is nullable in database, but non nullable in redis cache
  avatarURL: string;
  language: Language;
  generalSettingCode: number;
  privacySettingCode: number;
  createdAt: Date;
  updatedAt: Date;
};
