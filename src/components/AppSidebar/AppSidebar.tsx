import AccountSettingsPanel from "@/components/AccountSettingsPanel/AccountSettingsPanel";
import CreateShelfDialog from "@/components/CreateShelfDialog.tsx/CreateShelfDialog";
import AvatarIcon from "@/components/icons/AvatarIcon";
import PreferencesPanel from "@/components/PreferencesPanel/PreferencesPanel";
import { Button } from "@/components/ui/button";
import { Collapsible } from "@/components/ui/collapsible";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useLoading } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import { BellIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";

export function AppSidebar() {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userDataManager = useUserData();

  const [currentDisplayPopup, setCurrentDisplayPopup] = useState<
    "None" | "AccountSettingsPanel" | "PreferencesPanel" | "CreateShelfDialog"
  >("None");

  return (
    <Collapsible>
      <Sidebar className="block p-0 m-0">
        <AccountSettingsPanel
          isOpen={currentDisplayPopup === "AccountSettingsPanel"}
          onClose={() => setCurrentDisplayPopup("None")}
        />
        <PreferencesPanel
          isOpen={currentDisplayPopup === "PreferencesPanel"}
          onClose={() => setCurrentDisplayPopup("None")}
        />
        <CreateShelfDialog
          isOpen={currentDisplayPopup === "CreateShelfDialog"}
          onClose={() => setCurrentDisplayPopup("None")}
        />
        <SidebarHeader className="flex flex-col justify-center items-center p-2">
          <div className="w-full flex justify-between items-center bg-muted hover:bg-primary/50 rounded-sm pr-1">
            <Button
              className="w-4/5 bg-transparent hover:bg-transparent overflow-hidden flex justify-start select-none"
              onClick={() => setCurrentDisplayPopup("CreateShelfDialog")}
            >
              Create a new shelf
            </Button>
            <SidebarTrigger className="h-full bg-transparent" />
          </div>
          <Button className="w-full bg-muted hover:bg-primary/40 flex justify-between items-center select-none">
            Daily Routine
          </Button>
          <Button className="w-full bg-muted hover:bg-primary/40 flex justify-between items-center select-none">
            Community
          </Button>
          <Button className="w-full bg-muted hover:bg-primary/40 flex justify-between items-center select-none">
            Upgrade
          </Button>
        </SidebarHeader>
        <SidebarSeparator className="w-full m-0 p-0" />
        <SidebarContent>{}</SidebarContent>
        <SidebarSeparator className="w-full m-0 p-0" />
        <SidebarFooter className="w-full p-0 m-0">
          <Menubar className="w-full h-full flex flex-row justify-start items-center rounded-none bg-transparent border-none">
            <MenubarMenu>
              <MenubarTrigger className="w-full h-full my-1 flex flex-row gap-4 bg-transparent hover:bg-transparent">
                <AvatarIcon avatarURL="" size={28} />
                <div className="w-full flex flex-col text-start">
                  <span className="text-xs font-semibold text-foreground">
                    {userDataManager.userData?.name || "User Name"}
                  </span>
                  <span className="text-xs font-light text-foreground">
                    {userDataManager.userData?.status || "Offline"}
                  </span>
                </div>
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="px-2 py-2 flex items-center justify-center">
                <SettingsIcon size={20} />
              </MenubarTrigger>
              <MenubarContent className="w-64 bg-popover border-border">
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => setCurrentDisplayPopup("AccountSettingsPanel")}
                >
                  <span>
                    {languageManager.t(tKey.settings.accountSettings)}
                  </span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => setCurrentDisplayPopup("PreferencesPanel")}
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
            <MenubarMenu>
              <MenubarTrigger className="px-2 py-2 flex items-center justify-center">
                <BellIcon size={20} />
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </SidebarFooter>
      </Sidebar>
    </Collapsible>
  );
}
