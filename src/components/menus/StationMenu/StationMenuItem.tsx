import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { StationNode } from "@shared/types/stationNode.type";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardClock,
  ClipboardList,
  ExternalLink,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import ContextMenuCopyItems from "@/components/commons/ContextMenuCopyItems/ContextMenuCopyItems";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import TrainStationIcon from "@/components/icons/TrainStationIcon";
import RoutineMenu from "@/components/menus/RoutineMenu/RoutineMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  useAppRouter,
  useLanguage,
  useLoading,
  useModal,
  useStationRoutine,
} from "@/hooks";

interface StationMenuItemProps {
  station: StationNode;
}

const StationMenuItem = ({ station }: StationMenuItemProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const router = useAppRouter();
  const stationRoutineManager = useStationRoutine();
  const routineTaskCount = station.routineTasks.length;

  const handleRenameStationOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await stationRoutineManager
          .renameEditingStation()
          .catch(error => toast.error(languageManager.tError(error)));
      }),
    [languageManager, loadingManager, stationRoutineManager]
  );

  return (
    <Collapsible open={station.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {stationRoutineManager.isStationEditing(station.id) ? (
            <div className="relative flex h-8 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={stationRoutineManager.inputRef}
                type="text"
                value={stationRoutineManager.editStationName}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm text-ellipsis outline-none"
                onChange={event =>
                  stationRoutineManager.setEditStationName(
                    event.currentTarget.value
                  )
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameStationOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    stationRoutineManager.cancelRenamingStation();
                  }
                }}
              />
              {stationRoutineManager.isNewStationName() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={async event => {
                    event.stopPropagation();
                    await handleRenameStationOnSubmit();
                  }}
                  aria-label="Save station name"
                >
                  <CheckIcon className="size-4" />
                </button>
              )}
            </div>
          ) : (
            <HoverCard openDelay={250} closeDelay={100}>
              <HoverCardTrigger asChild>
                <ContextMenuTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="w-full rounded-sm pr-24"
                      onClick={() => {
                        void stationRoutineManager
                          .toggleStation(station.id)
                          .catch(error =>
                            toast.error(languageManager.tError(error))
                          );
                      }}
                    >
                      {station.isOpen ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )}
                      {station.icon ? (
                        <span className="shrink-0 select-none text-sm">
                          {station.icon}
                        </span>
                      ) : (
                        <TrainStationIcon size={16} />
                      )}
                      <span className="min-w-0 truncate">{station.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="z-[90] w-72 rounded-sm p-3 text-xs"
              >
                <HoverDetailCard
                  title={station.name}
                  subtitle="Station"
                  id={station.id}
                  rows={[
                    {
                      field: "Description",
                      value: station.description || "None",
                    },
                    { field: "Routines", value: station.routineCount },
                    { field: "Tasks", value: routineTaskCount },
                    { field: "Permission", value: station.permission },
                  ]}
                />
              </HoverCardContent>
            </HoverCard>
          )}
          <ContextMenuContent className="min-w-40">
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  router.push(
                    WebURLPathDictionary.root.routines.byStationId(station.id)
                  )
                }
              >
                <ExternalLink className="mr-2 size-4" />
                Overview Detail
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.openInspector({
                    type: "station",
                    id: station.id,
                  })
                }
              >
                <SquarePen className="mr-2 size-4" />
                Open in Inspector
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Add</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onSelect={() => {
                  window.setTimeout(() => {
                    modalManager.open("CreateRoutineDialog", {
                      stationId: station.id,
                      stationName: station.name,
                      onCreated: async routineId => {
                        station.isOpen = true;
                        stationRoutineManager.selectStation(station.id);
                        stationRoutineManager.selectRoutine(routineId);
                      },
                    });
                  }, 0);
                }}
              >
                <ClipboardClock className="mr-2 size-4" />
                Routine
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuCopyItems id={station.id} name={station.name} />
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.startRenamingStation(station)
                }
              >
                <Pencil className="mr-2 size-4" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteStationDialog", {
                    stationId: station.id,
                    stationName: station.name,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        {!stationRoutineManager.isStationEditing(station.id) &&
          (station.routineCount > 0 || routineTaskCount > 0) && (
            <div className="pointer-events-none absolute top-1 right-1 flex h-6 items-center text-xs text-foreground">
              {station.routineCount > 0 && (
                <HoverCard openDelay={250} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="pointer-events-auto flex h-6 min-w-4 items-center justify-center px-0.5 tabular-nums">
                      {station.routineCount}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="flex w-auto items-center gap-2 rounded-sm px-3 py-2"
                  >
                    <ClipboardClock className="size-4 text-muted-foreground" />
                    <span className="text-xs">
                      {station.routineCount} total routines
                    </span>
                  </HoverCardContent>
                </HoverCard>
              )}
              {station.routineCount > 0 && routineTaskCount > 0 && (
                <span
                  className="font-bold text-muted-foreground"
                  aria-hidden="true"
                >
                  ·
                </span>
              )}
              {routineTaskCount > 0 && (
                <HoverCard openDelay={250} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div className="pointer-events-auto flex h-6 min-w-4 items-center justify-center px-0.5 tabular-nums">
                      {routineTaskCount}
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="center"
                    className="flex w-auto items-center gap-2 rounded-sm px-3 py-2"
                  >
                    <ClipboardList className="size-4 text-muted-foreground" />
                    <span className="text-xs">
                      {routineTaskCount} total routine tasks
                    </span>
                  </HoverCardContent>
                </HoverCard>
              )}
            </div>
          )}
        <CollapsibleContent>
          <RoutineMenu station={station} routines={station.routines} />
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default StationMenuItem;
