import { ItemType as GraphQLItemType } from "@shared/api/graphql/generated/graphql";
import { ItemType } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import {
  BookmarkIcon,
  CheckIcon,
  ClipboardList,
  Copy,
  FileText,
  HistoryIcon,
  LoaderCircle,
  Package,
  PackagePlus,
  Pencil,
  SquarePen,
  Tags,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import ContextMenuCopyItems from "@/components/commons/ContextMenuCopyItems/ContextMenuCopyItems";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import RoutineTaskRecordDialog from "@/components/core/RoutineOverviewer/RoutineTaskRecordDialog";
import RoutineTaskMenu from "@/components/menus/RoutineTaskMenu/RoutineTaskMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  useLanguage,
  useLoading,
  useModal,
  useShelfItem,
  useStationRoutine,
} from "@/hooks";

interface RoutineMenuItemProps {
  station: StationNode;
  routine: RoutineNode;
}

const RoutineMenuItem = ({ station, routine }: RoutineMenuItemProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const shelfItemManager = useShelfItem();
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  const searchedItems =
    shelfItemManager.itemSearch.data?.searchItems?.searchEdges?.map(edge => {
      const item = edge.node as unknown as {
        id: UUID;
        type: GraphQLItemType;
        rootShelf?: { name?: string } | null;
        parentSubShelf?: { name?: string } | null;
      };
      return {
        id: item.id,
        type:
          item.type === GraphQLItemType.ItemTypeBlockPack
            ? ItemType.BlockPack
            : ItemType.Material,
        rootShelfName: item.rootShelf?.name ?? "Unknown root",
        parentSubShelfName: item.parentSubShelf?.name ?? "Unknown sub shelf",
      };
    }) ?? [];
  const searchedRoutineTasks = stationRoutineManager.routineTasks.filter(
    routineTask => routineTask.stationId === station.id
  );
  const routineTaskCandidates = Array.from(
    new Map(
      [...routine.routineTasks, ...searchedRoutineTasks].map(routineTask => [
        routineTask.id,
        routineTask,
      ])
    ).values()
  ).sort((leftRoutineTask, rightRoutineTask) =>
    leftRoutineTask.title.localeCompare(rightRoutineTask.title)
  );

  const handleRenameRoutineOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await stationRoutineManager
          .renameEditingRoutine()
          .catch(error => toast.error(languageManager.tError(error)));
      }),
    [languageManager, loadingManager, stationRoutineManager]
  );

  return (
    <Collapsible open={routine.isOpen}>
      <SidebarMenuSubItem>
        <ContextMenu>
          {stationRoutineManager.isRoutineEditing(routine.id) ? (
            <div className="relative flex h-7 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={stationRoutineManager.routineTitleInputRef}
                type="text"
                value={stationRoutineManager.editRoutineTitle}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm outline-none"
                onChange={event =>
                  stationRoutineManager.setEditRoutineTitle(
                    event.currentTarget.value
                  )
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameRoutineOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    stationRoutineManager.cancelRenamingRoutine();
                  }
                }}
              />
              {stationRoutineManager.isNewRoutineTitle() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={async event => {
                    event.stopPropagation();
                    await handleRenameRoutineOnSubmit();
                  }}
                  aria-label="Save routine title"
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
                    <SidebarMenuSubButton
                      isActive={
                        stationRoutineManager.selectedRoutineId === routine.id
                      }
                      className="cursor-pointer select-none"
                      onClick={() => {
                        stationRoutineManager.selectStation(station.id);
                        stationRoutineManager.selectRoutine(routine.id);
                        void stationRoutineManager
                          .toggleRoutine(station.id, routine.id)
                          .catch(error =>
                            toast.error(languageManager.tError(error))
                          );
                      }}
                    >
                      {routine.isPinned && (
                        <BookmarkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 truncate">{routine.title}</span>
                    </SidebarMenuSubButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="z-[90] w-80 rounded-sm p-3 text-xs"
              >
                <HoverDetailCard
                  title={routine.title}
                  subtitle="Routine"
                  id={routine.id}
                  rows={[
                    {
                      field: "Station",
                      value: station.name,
                    },
                    {
                      field: "Description",
                      value: routine.description || "None",
                    },
                    { field: "Status", value: routine.status },
                    { field: "Period", value: routine.period ?? "One-shot" },
                    { field: "Tags", value: routine.routineTagIds.length },
                    { field: "Tasks", value: routine.routineTaskIds.length },
                    {
                      field: "Start",
                      value: new Date(
                        routine.scheduledStartAt
                      ).toLocaleString(),
                    },
                    {
                      field: "End",
                      value: new Date(routine.scheduledEndAt).toLocaleString(),
                    },
                  ]}
                />
              </HoverCardContent>
            </HoverCard>
          )}

          <ContextMenuContent className="min-w-44">
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem onClick={() => setIsRecordDialogOpen(true)}>
                <HistoryIcon className="mr-2 size-4" />
                View all task records
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => {
                  stationRoutineManager.selectStation(station.id);
                  stationRoutineManager.selectRoutine(routine.id);
                  stationRoutineManager.openInspector({
                    type: "routine",
                    id: routine.id,
                  });
                }}
              >
                <SquarePen className="mr-2 size-4" />
                Open in Inspector
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Add</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() => {
                  void stationRoutineManager
                    .duplicateRoutine(routine.id)
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <Copy className="mr-2 size-4" />
                Duplicate
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  modalManager.open("CreateRoutineTaskDialog", {
                    stationId: station.id,
                    stationName: station.name,
                    onCreated: async routineTaskId => {
                      await stationRoutineManager.linkRoutineTask(
                        routine.id,
                        routineTaskId
                      );
                      routine.isOpen = true;
                    },
                  })
                }
              >
                <ClipboardList className="mr-2 size-4" />
                Task
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Link</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  window.setTimeout(() => {
                    void stationRoutineManager
                      .searchRoutineTags()
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }, 0);
                }}
              >
                <ContextMenuSubTrigger>
                  <Tags className="mr-2 size-4" />
                  Tags
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  className="max-h-72 min-w-48 overflow-y-auto"
                  onScroll={event => {
                    const target = event.currentTarget;
                    const pageInfo =
                      stationRoutineManager.searchRoutineTagsData
                        ?.searchRoutineTags?.searchPageInfo;
                    if (
                      target.scrollTop + target.clientHeight <
                        target.scrollHeight - 16 ||
                      !pageInfo?.hasNextPage ||
                      stationRoutineManager.isSearchingRoutineTags
                    ) {
                      return;
                    }
                    void stationRoutineManager
                      .loadMoreRoutineTags()
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }}
                >
                  {stationRoutineManager.routineTags.length === 0 ? (
                    <ContextMenuItem disabled>No Tags</ContextMenuItem>
                  ) : (
                    stationRoutineManager.routineTags.map(routineTag => {
                      const isLinked = routine.routineTagIds.includes(
                        routineTag.id
                      );
                      return (
                        <ContextMenuCheckboxItem
                          key={routineTag.id}
                          checked={isLinked}
                          onSelect={event => event.preventDefault()}
                          onCheckedChange={() => {
                            void stationRoutineManager
                              .linkRoutineTag(
                                routine.id,
                                routineTag.id,
                                isLinked
                              )
                              .catch(error =>
                                toast.error(languageManager.tError(error))
                              );
                          }}
                        >
                          {routineTag.name}
                        </ContextMenuCheckboxItem>
                      );
                    })
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  window.setTimeout(() => {
                    void stationRoutineManager
                      .searchRoutineTasksByStationId(
                        station.id,
                        "",
                        undefined,
                        true
                      )
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }, 0);
                }}
              >
                <ContextMenuSubTrigger>
                  <ClipboardList className="mr-2 size-4" />
                  Tasks
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  className="max-h-80 min-w-64 overflow-y-auto"
                  onScroll={event => {
                    const target = event.currentTarget;
                    const pageInfo =
                      stationRoutineManager.searchRoutineTasksData
                        ?.searchRoutineTasks?.searchPageInfo;
                    if (
                      target.scrollTop + target.clientHeight <
                        target.scrollHeight - 16 ||
                      !pageInfo?.hasNextPage ||
                      stationRoutineManager.isSearchingRoutineTasks
                    ) {
                      return;
                    }
                    void stationRoutineManager
                      .loadMoreRoutineTaskCandidates()
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }}
                >
                  {stationRoutineManager.isSearchingRoutineTasks &&
                  routineTaskCandidates.length === 0 ? (
                    <ContextMenuItem disabled>
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                      Loading
                    </ContextMenuItem>
                  ) : routineTaskCandidates.length === 0 ? (
                    <ContextMenuItem disabled>No Tasks</ContextMenuItem>
                  ) : (
                    routineTaskCandidates.map(routineTask => {
                      const isLinked = routine.routineTaskIds.includes(
                        routineTask.id
                      );
                      return (
                        <ContextMenuCheckboxItem
                          key={routineTask.id}
                          checked={isLinked}
                          onSelect={event => event.preventDefault()}
                          onCheckedChange={() => {
                            void stationRoutineManager
                              .linkRoutineTask(
                                routine.id,
                                routineTask.id,
                                isLinked
                              )
                              .catch(error =>
                                toast.error(languageManager.tError(error))
                              );
                          }}
                        >
                          <span className="min-w-0 truncate">
                            {routineTask.title}
                          </span>
                        </ContextMenuCheckboxItem>
                      );
                    })
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  window.setTimeout(() => {
                    void shelfItemManager
                      .searchItems({
                        query: "",
                        rootShelfId: null,
                        parentSubShelfId: null,
                      })
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }, 0);
                }}
              >
                <ContextMenuSubTrigger>
                  <PackagePlus className="mr-2 size-4" />
                  Items
                </ContextMenuSubTrigger>
                <ContextMenuSubContent
                  className="max-h-80 min-w-64 overflow-y-auto"
                  onScroll={event => {
                    const target = event.currentTarget;
                    const pageInfo =
                      shelfItemManager.itemSearch.data?.searchItems
                        ?.searchPageInfo;
                    if (
                      target.scrollTop + target.clientHeight <
                        target.scrollHeight - 16 ||
                      !pageInfo?.hasNextPage ||
                      shelfItemManager.itemSearch.loading
                    ) {
                      return;
                    }
                    void shelfItemManager
                      .loadMoreItems()
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }}
                >
                  {shelfItemManager.itemSearch.loading &&
                  searchedItems.length === 0 ? (
                    <ContextMenuItem disabled>
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                      Loading
                    </ContextMenuItem>
                  ) : searchedItems.length === 0 ? (
                    <ContextMenuItem disabled>No Items</ContextMenuItem>
                  ) : (
                    <>
                      {searchedItems.map(item => {
                        const isLinked = routine.itemIds.includes(item.id);
                        return (
                          <ContextMenuCheckboxItem
                            key={`${item.type}-${item.id}`}
                            checked={isLinked}
                            onSelect={event => event.preventDefault()}
                            onCheckedChange={() => {
                              void stationRoutineManager
                                .linkRoutineItem(
                                  routine.id,
                                  item.id,
                                  item.type,
                                  isLinked
                                )
                                .then(() =>
                                  toast.success(
                                    isLinked
                                      ? "Item disconnected"
                                      : "Item connected"
                                  )
                                )
                                .catch(error =>
                                  toast.error(languageManager.tError(error))
                                );
                            }}
                          >
                            {item.type === ItemType.BlockPack ? (
                              <Package className="mr-2 size-4" />
                            ) : (
                              <FileText className="mr-2 size-4" />
                            )}
                            <span className="min-w-0 truncate">
                              {item.rootShelfName} / {item.parentSubShelfName} /{" "}
                              {item.type} · {item.id.slice(0, 8)}
                            </span>
                          </ContextMenuCheckboxItem>
                        );
                      })}
                    </>
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuCopyItems
                id={routine.id}
                name={routine.title}
                nameLabel="Title"
              />
              <ContextMenuItem
                onClick={() => {
                  void stationRoutineManager
                    .updateRoutine(routine.id, { isPinned: !routine.isPinned })
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <BookmarkIcon className="mr-2 size-4" />
                {routine.isPinned ? "Unpin" : "Pin"}
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.startRenamingRoutine(routine)
                }
              >
                <Pencil className="mr-2 size-4" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteRoutineDialog", {
                    routineId: routine.id,
                    routineTitle: routine.title,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        <RoutineTaskRecordDialog
          open={isRecordDialogOpen}
          onOpenChange={setIsRecordDialogOpen}
          routineTitle={routine.title}
          routineTaskIds={routine.routineTaskIds}
        />

        {!stationRoutineManager.isRoutineEditing(routine.id) && (
          <CollapsibleContent>
            <RoutineTaskMenu routineTasks={routine.routineTasks} />
          </CollapsibleContent>
        )}
      </SidebarMenuSubItem>
    </Collapsible>
  );
};

export default RoutineMenuItem;
