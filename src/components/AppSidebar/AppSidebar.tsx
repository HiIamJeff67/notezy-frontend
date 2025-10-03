import AccountSettingsPanel from "@/components/AccountSettingsPanel/AccountSettingsPanel";
import AvatarIcon from "@/components/icons/AvatarIcon";
import PreferencesPanel from "@/components/PreferencesPanel/PreferencesPanel";
import RootShelfMenu from "@/components/RootShelfMenu/RootShelfMenu";
import CreateRootShelfDialog from "@/components/ShelfDialog/CreateRootShelfDialog";
import { Button } from "@/components/ui/button";
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
import {
  useAppRouter,
  useLanguage,
  useLoading,
  useShelfMaterial,
} from "@/hooks";
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

export function AppSidebar() {
  const router = useAppRouter();
  const sidebarManager = useSidebar();
  const loadingManager = useLoading();
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
                  sidebarManager.open ? "flex-row pr-2" : "flex-col-reverse"
                } flex justify-between items-center gap-1 hover:bg-accent rounded-sm`}
              >
                <SidebarMenuButton asChild>
                  <Button className="w-9/10 bg-transparent flex justify-start items-center select-none">
                    <LayoutDashboardIcon />
                    {sidebarManager.open && (
                      <span className="truncate">Dashboard</span>
                    )}
                  </Button>
                </SidebarMenuButton>
                <SidebarTrigger
                  variant={"secondary"}
                  className="bg-transparent hover:bg-primary/60 select-none"
                />
              </SidebarMenuItem>
              <SidebarMenuItem className="hover:bg-primary/60 rounded-sm">
                <Button
                  className={`w-full bg-transparent hover:bg-transparent flex ${
                    sidebarManager.open ? "justify-start" : "justify-center"
                  } items-center select-none`}
                >
                  <CalendarIcon />
                  {sidebarManager.open && (
                    <span className="truncate">Daily Routine</span>
                  )}
                </Button>
              </SidebarMenuItem>
              <SidebarMenuItem className="hover:bg-primary/60 rounded-sm">
                <Button
                  className={`w-full bg-transparent hover:bg-transparent flex ${
                    sidebarManager.open ? "justify-start" : "justify-center"
                  } items-center select-none`}
                >
                  <MessageSquareIcon />
                  {sidebarManager.open && (
                    <span className="truncate">Community</span>
                  )}
                </Button>
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
                    <SidebarMenuButton className="rounded-sm" asChild>
                      <Button className="flex flex-row justify-start items-center gap-2 bg-transparent hover:bg-transparent">
                        <ShelfCaseIcon size={16} />
                        <span>Shelves</span>
                      </Button>
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
  );
}
