import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { tKey } from "@shared/translations";
import {
  BellIcon,
  ChevronDown,
  ChevronRight,
  ClipboardClock,
  LayoutDashboardIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
  TagIcon,
} from "lucide-react";
import { useEffect } from "react";
import TruncatedText from "@/components/commons/TruncatedText/TruncatedText";
import AvatarIcon from "@/components/icons/AvatarIcon";
import ShelfCaseIcon from "@/components/icons/ShelfCaseIcon";
import TrainStationIcon from "@/components/icons/TrainStationIcon";
import RootShelfMenu from "@/components/menus/RootShelfMenu/RootShelfMenu";
import RoutineTagMenu from "@/components/menus/RoutineTagMenu/RoutineTagMenu";
import StationMenu from "@/components/menus/StationMenu/StationMenu";
import ResizableSidebar from "@/components/sidebar/ResizableSidebar/ResizableSidebar";
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
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  useAppRouterActions,
  useLanguage,
  useResizeSidebar,
  useShelfItem,
  useStationRoutine,
} from "@/hooks";
import { useModal } from "@/hooks/useModal";
import { useUser } from "@/hooks/useUser";

interface AppSidebarProps {
  disabled?: boolean;
}

export function AppSidebar({ disabled = false }: AppSidebarProps) {
  if (disabled) return <></>;

  const router = useAppRouterActions();
  const languageManager = useLanguage();
  const modalManager = useModal();
  const sidebarManager = useSidebar();
  const resizableSidebarManager = useResizeSidebar();
  const stationRoutineManager = useStationRoutine();
  const userManager = useUser();
  const shelfItemManager = useShelfItem();

  useEffect(() => {
    if (!userManager.userData) return;

    const initiallySearchRootShelves = async () =>
      await shelfItemManager
        .searchRootShelves()
        .catch(error => toast.error(languageManager.tError(error)));
    const initiallyLoadStationRoutineData = async () =>
      await stationRoutineManager
        .initializeStationRoutineData()
        .catch(error => toast.error(languageManager.tError(error)));
    initiallySearchRootShelves();
    initiallyLoadStationRoutineData();
  }, [userManager.userData?.publicId]);

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
                  onClick={() =>
                    router.push(WebURLPathDictionary.root.dashboard._)
                  }
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
                  onClick={() =>
                    router.push(WebURLPathDictionary.root.routines._)
                  }
                >
                  <ClipboardClock />
                  {sidebarManager.open && (
                    <span className="truncate">Routines</span>
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
        <SidebarGroup className="mb-0 pb-0">
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="gap-2 [&[data-state=closed]:hover_.group-label-chevron-right]:block [&[data-state=open]:hover_.group-label-chevron-down]:block">
                <ShelfCaseIcon size={16} />
                <span>Shelves</span>
                <ChevronRight className="group-label-chevron-right hidden size-3" />
                <ChevronDown className="group-label-chevron-down hidden size-3" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <SidebarGroupAction
              className="sidebar-group-label-action opacity-0 transition-opacity text-muted-foreground"
              aria-label="Create root shelf"
              title="Create root shelf"
              onClick={() =>
                modalManager.open("CreateShelfItemDialog", {
                  dialogHeader: "Create a root shelf",
                  dialogDescription: "Type a name for the new root shelf.",
                  disableInput: false,
                  inputPlaceholder: "Type new name here",
                  onCreate: async (newRootShelfName: string) => {
                    await shelfItemManager
                      .createRootShelf(newRootShelfName)
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  },
                  onCancel: modalManager.close,
                })
              }
            >
              <PlusIcon />
            </SidebarGroupAction>
            <CollapsibleContent className="sidebar-group-collapsible-content overflow-hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub className="w-full pr-4">
                      <SidebarMenuSubItem className="w-full">
                        <RootShelfMenu />
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarGroup className="my-0 pb-0">
          <Collapsible defaultOpen className="group/collapsible">
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="gap-2 [&[data-state=closed]:hover_.group-label-chevron-right]:block [&[data-state=open]:hover_.group-label-chevron-down]:block">
                <TrainStationIcon size={16} />
                <span>Stations</span>
                <ChevronRight className="group-label-chevron-right hidden size-3" />
                <ChevronDown className="group-label-chevron-down hidden size-3" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <SidebarGroupAction
              className="sidebar-group-label-action opacity-0 transition-opacity text-muted-foreground"
              aria-label="Create station"
              title="Create station"
              onClick={() => modalManager.open("CreateStationDialog", {})}
            >
              <PlusIcon />
            </SidebarGroupAction>
            <CollapsibleContent className="sidebar-group-collapsible-content overflow-hidden">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuSub className="w-full pr-4">
                      <SidebarMenuSubItem className="w-full">
                        <StationMenu />
                        <div className="my-2 flex flex-col gap-1 border-t border-sidebar-border pt-2">
                          <div className="group/routine-tags-label flex h-7 items-center justify-between px-2 text-xs text-muted-foreground">
                            <div className="flex min-w-0 items-center gap-2">
                              <TagIcon className="size-3.5 shrink-0" />
                              <span className="truncate">Routine tags</span>
                            </div>
                            <button
                              type="button"
                              className="flex size-5 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover/routine-tags-label:opacity-100 focus-visible:opacity-100"
                              aria-label="Create routine tag"
                              title="Create routine tag"
                              onClick={() =>
                                modalManager.open("CreateRoutineTagDialog", {
                                  onCreated: async routineTagId => {
                                    stationRoutineManager.selectRoutineTag(
                                      routineTagId
                                    );
                                  },
                                })
                              }
                            >
                              <PlusIcon className="size-3.5" />
                            </button>
                          </div>
                          <RoutineTagMenu />
                        </div>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
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
                  onSelect={() => modalManager.open("AccountSettingsPanel")}
                >
                  <span>
                    {languageManager.t(tKey.settings.accountSettings)}
                  </span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer"
                  onSelect={() => modalManager.open("PreferencesPanel")}
                >
                  <span>{languageManager.t(tKey.settings.preferences)}</span>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className="cursor-pointer">
                  <span>{languageManager.t(tKey.auth.switchAccount)}</span>
                </MenubarItem>
                <MenubarItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={async () => {
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
