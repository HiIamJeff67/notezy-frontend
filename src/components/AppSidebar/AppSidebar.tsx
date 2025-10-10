"use client";

import AccountSettingsPanel from "@/components/AccountSettingsPanel/AccountSettingsPanel";
import AvatarIcon from "@/components/icons/AvatarIcon";
import PreferencesPanel from "@/components/PreferencesPanel/PreferencesPanel";
import RootShelfMenu from "@/components/RootShelfMenu/RootShelfMenu";
import CreateRootShelfDialog from "@/components/ShelfDialog/CreateRootShelfDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useShelfMaterial } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import { WebURLPathDictionary } from "@shared/constants";
import { tKey } from "@shared/translations";
import {
  BellIcon,
  CalendarIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ShelfCaseIcon from "../icons/ShelfCaseIcon";

interface AppSidebarProps {
  disabled?: boolean;
}

export function AppSidebar({ disabled = false }: AppSidebarProps) {
  if (disabled) return <></>;

  const router = useAppRouter();
  const sidebarManager = useSidebar();
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const shelfMaterialManager = useShelfMaterial();

  useEffect(() => {
    const initialSearchRootShelves = async () => {
      try {
        await shelfMaterialManager.searchRootShelves();
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    };
    initialSearchRootShelves();
  }, []);

  const [currentDisplayPopup, setCurrentDisplayPopup] = useState<
    | "None"
    | "AccountSettingsPanel"
    | "PreferencesPanel"
    | "CreateRootShelfDialog"
  >("None");

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="p-0 m-0 overflow-hidden"
    >
      <AccountSettingsPanel
        isOpen={currentDisplayPopup === "AccountSettingsPanel"}
        onClose={() => setCurrentDisplayPopup("None")}
      />
      <PreferencesPanel
        isOpen={currentDisplayPopup === "PreferencesPanel"}
        onClose={() => setCurrentDisplayPopup("None")}
      />
      <CreateRootShelfDialog
        isOpen={currentDisplayPopup === "CreateRootShelfDialog"}
        onClose={() => setCurrentDisplayPopup("None")}
      />
      <SidebarHeader className="flex flex-col justify-center items-center p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem
                className={`${
                  sidebarManager.open ? "flex-row pr-1" : "flex-col-reverse"
                } flex justify-between items-center gap-1 hover:bg-accent rounded-sm`}
              >
                <SidebarMenuButton
                  className="w-19/20 bg-transparent hover:bg-primary flex justify-start items-center select-none"
                  onClick={() => {
                    router.push(WebURLPathDictionary.root.dashboard);
                  }}
                >
                  <LayoutDashboardIcon />
                  {sidebarManager.open && (
                    <span className="truncate">Dashboard</span>
                  )}
                </SidebarMenuButton>
                <SidebarTrigger
                  variant={"default"}
                  className="select-none bg-transparent hover:bg-primary"
                />
              </SidebarMenuItem>
              <SidebarMenuItem className="rounded-sm">
                <SidebarMenuButton
                  className={`w-full flex ${
                    sidebarManager.open ? "justify-start" : "justify-center"
                  } items-center select-none hover:bg-primary`}
                >
                  <CalendarIcon />
                  {sidebarManager.open && (
                    <span className="truncate">Daily Routine</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="rounded-sm">
                <SidebarMenuButton
                  className={`w-full flex ${
                    sidebarManager.open ? "justify-start" : "justify-center"
                  } items-center select-none hover:bg-primary`}
                >
                  <MessageSquareIcon />
                  {sidebarManager.open && (
                    <span className="truncate">Community</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarSeparator className="w-full m-0 p-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="flex flex-row justify-start items-center gap-2 hover:bg-primary">
                      <ShelfCaseIcon size={16} />
                      <span>Shelves</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <SidebarMenuAction
                    onClick={() =>
                      setCurrentDisplayPopup("CreateRootShelfDialog")
                    }
                  >
                    <PlusIcon />
                  </SidebarMenuAction>
                  <CollapsibleContent className="overflow-hidden">
                    <SidebarMenuSub className="w-full pr-4">
                      <SidebarMenuSubItem className="w-full">
                        <RootShelfMenu />
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
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
                <span>{languageManager.t(tKey.settings.accountSettings)}</span>
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
                onClick={async () => {
                  router.push(WebURLPathDictionary.home);
                  await userDataManager.logout();
                  toast.success("Logout successfully, see you next time ~");
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
  );
}
