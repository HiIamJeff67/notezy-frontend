import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import type { StationNode } from "@shared/types/stationNode.type";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardClock,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
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
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  useAppRouter,
  useLanguage,
  useLoading,
  useModal,
  useRoutine,
} from "@/hooks";

interface StationMenuItemProps {
  station: StationNode;
}

const StationMenuItem = ({ station }: StationMenuItemProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const router = useAppRouter();
  const routineManager = useRoutine();
  const routineTaskCount = station.routineTasks.length;

  const handleRenameStationOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await routineManager
          .renameEditingStation()
          .catch(error => toast.error(languageManager.tError(error)));
      }),
    [languageManager, loadingManager, routineManager]
  );

  return (
    <Collapsible open={station.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {routineManager.isStationEditing(station.id) ? (
            <div className="relative flex h-8 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={routineManager.inputRef}
                type="text"
                value={routineManager.editStationName}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm text-ellipsis outline-none"
                onChange={event =>
                  routineManager.setEditStationName(event.currentTarget.value)
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameStationOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    routineManager.cancelRenamingStation();
                  }
                }}
              />
              {routineManager.isNewStationName() && (
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
            <ContextMenuTrigger asChild>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="w-full rounded-sm pr-24"
                  onClick={() => {
                    void routineManager
                      .toggleStation(station.id)
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }}
                >
                  {station.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
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
          )}
          <ContextMenuContent className="min-w-40">
            <ContextMenuLabel>Create</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  modalManager.open("CreateRoutineDialog", {
                    stationId: station.id,
                    stationName: station.name,
                    onCreated: async routineId => {
                      station.isOpen = true;
                      routineManager.selectStation(station.id);
                      routineManager.selectRoutine(routineId);
                    },
                  })
                }
              >
                <ClipboardClock className="mr-2 size-4" />
                Routine
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() => routineManager.startRenamingStation(station)}
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
                    onDeleted: async () => {
                      if (routineManager.selectedStationId === station.id) {
                        routineManager.selectStation(null);
                        routineManager.selectRoutine(null);
                      }
                      await routineManager.refresh();
                    },
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        {!routineManager.isStationEditing(station.id) && (
          <div className="pointer-events-none absolute top-1 right-1 flex h-6 items-center gap-1 text-xs text-foreground">
            <button
              type="button"
              className="pointer-events-auto flex size-5 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100"
              aria-label={`Open ${station.name} overview`}
              title={`Open ${station.name} overview`}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                router.push(
                  WebURLPathDictionary.root.routines.byStationId(station.id)
                );
              }}
            >
              <ExternalLink className="size-3.5" />
            </button>
            <span
              className="min-w-4 text-center tabular-nums"
              title={`${station.routineCount} routines`}
            >
              {station.routineCount}
            </span>
            <span
              className="font-bold text-muted-foreground"
              aria-hidden="true"
            >
              ·
            </span>
            <span
              className="min-w-4 text-center tabular-nums"
              title={`${routineTaskCount} routine tasks`}
            >
              {routineTaskCount}
            </span>
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
