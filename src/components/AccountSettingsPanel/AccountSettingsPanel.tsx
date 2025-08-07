"use client";

import { GetMyInfo } from "@/api/userInfo.api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import {
  PrivateFakeUser,
  PrivateFakeUserInfo,
} from "@/shared/constants/defaultFakeUser.constant";
import { PrivateUser, PrivateUserInfo } from "@/shared/types/user.type";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
  const [user, setUser] = useState<PrivateUser>(PrivateFakeUser);
  const [userInfo, setUserInfo] =
    useState<PrivateUserInfo>(PrivateFakeUserInfo);

  useEffect(() => {
    const refreshUser = async function (): Promise<void> {
      if (
        userDataManager.userData !== undefined &&
        userDataManager.userData !== null
      ) {
        setUser(init => ({
          publicId: userDataManager.userData?.publicId ?? init.publicId,
          name: userDataManager.userData?.name ?? init.name,
          displayName:
            userDataManager.userData?.displayName ?? init.displayName,
          email: userDataManager.userData?.email ?? init.email,
          role: userDataManager.userData?.role ?? init.role,
          plan: userDataManager.userData?.plan ?? init.plan,
          status: userDataManager.userData?.status ?? init.status,
          updatedAt: userDataManager.userData
            ? new Date(userDataManager.userData.updatedAt)
            : init.updatedAt,
          createdAt: userDataManager.userData
            ? new Date(userDataManager.userData.createdAt)
            : init.createdAt,
        }));
      }
    };

    if (isOpen) {
      // block to only refresh the user while the account setting panel is opened
      refreshUser();
    }
  }, [isOpen, userDataManager.userData]);

  useEffect(() => {
    const refreshUserInfo = async function (): Promise<void> {
      try {
        const userAgent = navigator.userAgent;
        const response = await GetMyInfo({
          header: {
            userAgent: userAgent,
          },
        });
        setUserInfo(init => ({
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

    refreshUserInfo();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4/5 p-0 overflow-hidden">
        <div className="flex h-[520px]">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            {currentPage === "profile" && (
              <ProfileTab user={user} userInfo={userInfo} />
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
