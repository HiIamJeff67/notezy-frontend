"use client";

import { GetMyInfo } from "@/api/userInfo.api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
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
} from "@/shared/enums";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import AccountModificationTab from "./AccountModificationTab";
import BindingTab from "./BindingTab";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import Sidebar from "./Sidebar";
import UpgradeTab from "./UpgradeTab";

export type AccountSettingsPage =
  | "profile"
  | "upgrade"
  | "security"
  | "binding"
  | "accountModification";

export const AccountSettingUserSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  displayName: z.string(),
  email: z.string(),
  role: z.enum(AllUserRoles),
  plan: z.enum(AllUserPlans),
  status: z.enum(AllUserStatus),
  updatedAt: z.date(),
  createdAt: z.date(),
});

export const AccountSettingUserInfoSchema = z.object({
  avatarURL: z.string().nullable(),
  coverBackgroundURL: z.string().nullable(),
  header: z.string().nullable(),
  introduction: z.string().nullable(),
  gender: z.enum(AllUserGenders),
  country: z.enum(AllCountries).nullable(),
  birthDate: z.date(),
  updatedAt: z.date(),
});

export type AccountSettingUser = z.infer<typeof AccountSettingUserSchema>;
export type AccountSettingUserInfo = z.infer<
  typeof AccountSettingUserInfoSchema
>;

interface AccountSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSettingsPanel = ({
  isOpen,
  onClose,
}: AccountSettingsPanelProps) => {
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const [currentPage, setCurrentPage] =
    useState<AccountSettingsPage>("profile");
  const [accountSettingUser, setAccountSettingUser] =
    useState<AccountSettingUser>({
      publicId: "",
      name: "",
      displayName: "",
      email: "",
      role: UserRole.Normal,
      plan: UserPlan.Free,
      status: UserStatus.Online,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  const [accountSettingUserInfo, setAccountSettingUserInfo] =
    useState<AccountSettingUserInfo>({
      avatarURL: "",
      coverBackgroundURL: "",
      header: "",
      introduction: "",
      gender: UserGender.PreferNotToSay,
      country: Country.Taiwan,
      birthDate: new Date(),
      updatedAt: new Date(),
    });

  useEffect(() => {
    const prepareUserInfo = async function (): Promise<void> {
      try {
        const userAgent = navigator.userAgent;
        const response = await GetMyInfo({
          header: {
            userAgent: userAgent,
          },
        });
        setAccountSettingUserInfo(init => ({
          ...init,
          avatarURL: response.data.avatarURL,
          coverBackgroundURL: response.data.coverBackgroundURL,
          header: response.data.header,
          introduction: response.data.introduction,
          gender: response.data.gender,
          country: response.data.country,
          birthDate: new Date(response.data.birthDate),
          updatedAt: new Date(response.data.updatedAt),
        }));
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    };

    prepareUserInfo();
  }, []);

  useEffect(() => {
    const prepareUser = function (): void {
      if (
        userDataManager.userData !== undefined &&
        userDataManager.userData !== null
      ) {
        setAccountSettingUser(init => ({
          publicId: userDataManager.userData?.publicId ?? init.publicId,
          name: userDataManager.userData?.name ?? init.name,
          displayName:
            userDataManager.userData?.displayName ?? init.displayName,
          email: userDataManager.userData?.email ?? init.email,
          role: userDataManager.userData?.role ?? init.role,
          plan: userDataManager.userData?.plan ?? init.plan,
          status: userDataManager.userData?.status ?? init.status,
          updatedAt: new Date(
            userDataManager.userData?.updatedAt ?? init.updatedAt
          ),
          createdAt: new Date(
            userDataManager.userData?.createdAt ?? init.createdAt
          ),
        }));
      }
    };

    prepareUser();
  }, [userDataManager.userData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4/5 p-0 overflow-hidden">
        <div className="flex h-[520px]">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            {currentPage === "profile" && (
              <ProfileTab
                accountSettingUser={accountSettingUser}
                accountSettingUserInfo={accountSettingUserInfo}
                setAccountSettingUser={setAccountSettingUser}
                setAccountSettingUserInfo={setAccountSettingUserInfo}
              />
            )}
            {currentPage === "upgrade" && <UpgradeTab />}
            {currentPage === "security" && <SecurityTab />}
            {currentPage === "binding" && <BindingTab />}
            {currentPage === "accountModification" && (
              <AccountModificationTab />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsPanel;
