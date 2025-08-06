"use client";

import { GetUserData } from "@/api/user.api";
import AccountSettingsPanel from "@/components/AccountSettingsPanel/AccountSettingsPanel";
import { AppSidebar } from "@/components/AppSidebar/AppSidebar";
import AvatarIcon from "@/components/icons/AvatarIcon";
import PreferencesPanel from "@/components/PreferencesPanel/PreferencesPanel";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useLoading, useTheme } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { Bell, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const themeManager = useTheme();

  const [currentDisplayPanel, setCurrentDisplayPanel] = useState<
    "None" | "AccountSettingsPanel" | "PreferencesPanel"
  >("None");

  useEffect(() => {
    if (userDataManager.userData === null) {
      const tryGetUser = async () => {
        try {
          const userAgent = navigator.userAgent;
          const responseOfGetMe = await GetUserData({
            header: {
              userAgent: userAgent,
            },
            body: {},
          });
          userDataManager.setUserData(responseOfGetMe.data);
        } catch {
          toast.error(
            "Your account has been logged out, please try to log in again."
          );
          router.push(WebURLPathDictionary.auth.login);
        }
      };

      tryGetUser();
    }

    loadingManager.setIsLoading(false);
  }, []);

  return (
    <div>
      <AppSidebar />
      <SidebarTrigger className="fixed top-2 left-2" />

      <AccountSettingsPanel
        isOpen={currentDisplayPanel === "AccountSettingsPanel"}
        onClose={() => setCurrentDisplayPanel("None")}
      />

      <PreferencesPanel
        isOpen={currentDisplayPanel === "PreferencesPanel"}
        onClose={() => setCurrentDisplayPanel("None")}
      />

      <div className="fixed top-2 right-2 z-50">
        <Menubar className="bg-secondary border-border border shadow-lg h-8">
          <MenubarMenu>
            <MenubarTrigger className="px-3 py-2 w-11 h-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground">
              <Palette size={20} />
            </MenubarTrigger>
            <MenubarContent className="w-56 bg-popover border-border">
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {`${languageManager.t(tKey.common.choose)}${languageManager.t(
                  tKey.syntax.separator
                )}${languageManager.t(tKey.themes.theme)}`}
              </div>
              <MenubarSeparator />
              {themeManager.availableThemes.map(theme => (
                <MenubarItem
                  key={theme.id}
                  onClick={() => themeManager.switchCurrentTheme(theme.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{languageManager.t(theme.translationKey)}</span>
                  {themeManager.currentTheme === theme && (
                    <span className="text-accent text-sm">✓</span>
                  )}
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-3 py-2 w-10 h-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground">
              <Bell size={24} />
            </MenubarTrigger>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="px-2 py-2 h-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground">
              <AvatarIcon avatarURL="" size={20} />
            </MenubarTrigger>
            <MenubarContent className="w-64 bg-popover border-border">
              <div className="flex items-center space-x-3 px-3 py-3">
                <AvatarIcon avatarURL="" size={48} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {userDataManager.userData?.name || "User Name"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {userDataManager.userData?.email || "user@example.com"}
                  </span>
                </div>
              </div>
              <MenubarSeparator />
              <MenubarItem
                className="cursor-pointer"
                onClick={() => setCurrentDisplayPanel("AccountSettingsPanel")}
              >
                <span>{languageManager.t(tKey.settings.accountSettings)}</span>
              </MenubarItem>
              <MenubarItem
                className="cursor-pointer"
                onClick={() => setCurrentDisplayPanel("PreferencesPanel")}
              >
                <span>{languageManager.t(tKey.settings.preferences)}</span>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="cursor-pointer">
                <span>{languageManager.t(tKey.auth.switchAccount)}</span>
              </MenubarItem>
              <MenubarItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => {
                  loadingManager.setIsLoading(true);
                  router.push(WebURLPathDictionary.home);
                  userDataManager.logout();
                }}
              >
                <span>{languageManager.t(tKey.auth.logout)}</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default DashboardPage;
