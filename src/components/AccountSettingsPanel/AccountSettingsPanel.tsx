"use client";

import { GetMyInfo } from "@/api/userInfo.api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { PrivateFakeUser, PrivateFakeUserInfo } from "@shared/constants";
import { PrivateUser, PrivateUserInfo } from "@shared/types/models";
import { lazy, Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import AccountModificationTab from "./AccountModificationTab";
import AccountTab from "./AccountTab";
import BindingTab from "./BindingTab";
import ProfileTabSkeleton from "./ProfileTabSkeleton";
import SecurityTab from "./SecurityTab";
import Sidebar from "./Sidebar";
import UpgradeTab from "./UpgradeTab";

// lazy loading the profile tab
const ProfileTab = lazy(() => import("./ProfileTab"));

export type AccountSettingsPage =
  | "profile"
  | "account"
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

  const [showProfileContent, setShowProfileContent] = useState(false);

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

    if (isOpen) {
      refreshUserInfo();
    }
  }, [isOpen, languageManager]);

  useEffect(() => {
    if (isOpen && currentPage === "profile") {
      setShowProfileContent(false);

      const timer = setTimeout(() => {
        setShowProfileContent(true);
      }, 200); // timeout to show the actual profile tab

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPage]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4/5 p-0 overflow-hidden border-none">
        <div className="flex h-[520px]">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="flex-1 h-[520px]">
            {currentPage === "profile" &&
              (!showProfileContent ? (
                <ProfileTabSkeleton />
              ) : (
                <Suspense fallback={<ProfileTabSkeleton />}>
                  <ProfileTab userInfo={userInfo} />
                </Suspense>
              ))}
            {currentPage === "account" && <AccountTab user={user} />}
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
