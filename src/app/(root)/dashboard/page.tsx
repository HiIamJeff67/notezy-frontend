"use client";

import { GetMe } from "@/api/user.api";
import { AppSidebar } from "@/components/AppSidebar";
import AvatarIcon from "@/components/icons/AvatarIcon";
import BellIcon from "@/components/icons/BellIcon";
import ColorPaletteIcon from "@/components/icons/ColorPaletteIcon";
import PreferencesPanel from "@/components/PreferencesPanel";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useLoading, useTheme } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { WebURLPathDictionary } from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const themeManager = useTheme();
  const sidebarManager = useSidebar();

  const [displayPreferencesPanel, setDisplayPreferencesPanel] =
    useState<boolean>(false);

  useEffect(() => {
    console.log(userDataManager.userData);
    if (userDataManager.userData === null) {
      const tryGetUser = async () => {
        try {
          const userAgent = navigator.userAgent;
          const responseOfGetMe = await GetMe({
            header: {
              userAgent: userAgent,
              authorization: undefined,
            },
            body: {},
          });
          userDataManager.setUserData(responseOfGetMe.data);
        } catch {
          toast.error(
            "Your account has been logged out, please try to log in again."
          );
          router.push(WebURLPathDictionary.login);
        }
      };

      tryGetUser();
    }

    loadingManager.setIsLoading(false);
    console.log(userDataManager.userData);
  }, []);

  return (
    <div>
      <AppSidebar />
      {!sidebarManager.open && (
        <SidebarTrigger className="fixed top-2 left-2" />
      )}

      <PreferencesPanel
        isOpen={displayPreferencesPanel}
        onClose={() => setDisplayPreferencesPanel(false)}
      />

      <div className="fixed top-2 right-2 z-50">
        <Menubar className="bg-secondary border-border border shadow-lg h-8">
          <MenubarMenu>
            <MenubarTrigger className="px-3 py-2 w-11 h-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground">
              <ColorPaletteIcon size={24} className="" />
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
              <BellIcon size={24} className="" />
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
              <MenubarItem className="cursor-pointer">
                <span>Account Settings</span>
              </MenubarItem>
              <MenubarItem
                className="cursor-pointer"
                onClick={() => setDisplayPreferencesPanel(true)}
              >
                <span>Preferences</span>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem className="cursor-pointer">
                <span>Switch Account</span>
              </MenubarItem>
              <MenubarItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => {
                  console.log("Logout clicked");
                }}
              >
                <span>Log Out</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default DashboardPage;
