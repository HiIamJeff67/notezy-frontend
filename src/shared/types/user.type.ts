import { Country, UserGender, UserPlan, UserRole, UserStatus } from "../enums";

export type PublicUser = {
  publicId: string;
  name: string;
  displayName: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: Date;
};

export type PublicUserInfo = {
  coverBackgroundURL: string;
  avatarURL: string;
  header: string;
  introduction: string;
  gender: UserGender;
  country: Country;
  birthDate: Date;
};

export type PrivateUser = {
  publicId: string;
  name: string;
  displayName: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: Date;
};

export type PrivateUserInfo = {
  coverBackgroundURL: string;
  avatarURL: string;
  header: string;
  introduction: string;
  gender: UserGender;
  country: Country;
  birthDate: Date;
  updatedAt: Date;
};
