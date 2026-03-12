"use client";

import AvatarIcon from "@/components/icons/AvatarIcon";
import RootShelfMenu from "@/components/RootShelfMenu/RootShelfMenu";
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
  useResizeSidebar,
  useShelfItem,
} from "@/hooks";
import { useModal } from "@/hooks/useModal";
import { useUser } from "@/hooks/useUser";
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
import { useEffect } from "react";
import toast from "react-hot-toast";
import ShelfCaseIcon from "../icons/ShelfCaseIcon";
import ResizableSidebar from "../ResizableSidebar/ResizableSidebar";
import TruncatedText from "../TruncatedText/TruncatedText";

interface AppSidebarProps {
  disabled?: boolean;
}

export function AppSidebar({ disabled = false }: AppSidebarProps) {
  if (disabled) return <></>;

  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const modalManager = useModal();
  const sidebarManager = useSidebar();
  const resizableSidebarManager = useResizeSidebar();
  const userManager = useUser();
  const shelfItemManager = useShelfItem();

  useEffect(() => {
    const initialSearchRootShelves = async () => {
      try {
        await shelfItemManager.searchRootShelves();
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    };
    initialSearchRootShelves();
  }, []);

  return (
    <ResizableSidebar
      variant="sidebar"
      collapsible="icon"
      className="p-0 m-0 overflow-hidden"
    >
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
                    router.push(WebURLPathDictionary.root.dashboard._);
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
                      modalManager.open("CreateShelfItemDialog", {
                        dialogHeader:
                          "Create a root shelf by typing an new name",
                        disableInput: false,
                        inputPlaceholder:
                          "type your new and unique shelf name here",
                        onCreate: async (newRootShelfName: string) =>
                          await loadingManager.startAsyncTransactionLoading(
                            async () => {
                              await shelfItemManager
                                .createRootShelf(newRootShelfName)
                                .then(modalManager.close)
                                .catch(error =>
                                  toast.error(languageManager.tError(error))
                                );
                            }
                          ),
                        onCancel: modalManager.close,
                      })
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
            <MenubarTrigger className="h-full my-1 flex flex-1 flex-row min-w-0 gap-2 bg-transparent hover:bg-transparent">
              <AvatarIcon avatarURL="" size={30} />
              <div className="w-full flex flex-col text-start">
                <TruncatedText
                  className="text-xs font-semibold text-foreground transition-all"
                  width={`${resizableSidebarManager.width - 160}px`}
                >
                  {userManager.userData?.name || "User Name"}
                </TruncatedText>
                <TruncatedText
                  className="text-xs font-light text-foreground transition-all"
                  width={`${resizableSidebarManager.width - 160}px`}
                >
                  {userManager.userData?.status || "Offline"}
                </TruncatedText>
              </div>
            </MenubarTrigger>
          </MenubarMenu>
          {sidebarManager.open && (
            <MenubarMenu>
              <MenubarTrigger className="px-2 py-2 flex items-center justify-center">
                <SettingsIcon size={20} />
              </MenubarTrigger>
              <MenubarContent className="w-64 bg-popover border-border">
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => modalManager.open("AccountSettingsPanel")}
                >
                  <span>
                    {languageManager.t(tKey.settings.accountSettings)}
                  </span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer"
                  onClick={() => modalManager.open("PreferencesPanel")}
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
                    await userManager.logout();
                    toast.success("Logout successfully, see you next time ~");
                  }}
                >
                  <span>{languageManager.t(tKey.auth.logout)}</span>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          )}
          {sidebarManager.open && (
            <MenubarMenu>
              <MenubarTrigger className="px-2 py-2 flex items-center justify-center">
                <BellIcon size={20} />
              </MenubarTrigger>
            </MenubarMenu>
          )}
        </Menubar>
      </SidebarFooter>
    </ResizableSidebar>
  );
}
