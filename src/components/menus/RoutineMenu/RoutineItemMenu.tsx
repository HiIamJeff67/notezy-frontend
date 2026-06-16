import { ItemType as GraphQLItemType } from "@shared/api/graphql/generated/graphql";
import { ItemType } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import type { UUID } from "crypto";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  LoaderCircle,
  Package,
  PackagePlus,
  Pencil,
  SquarePen,
  Tags,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import RoutineTaskMenuItem from "@/components/menus/StationMenu/RoutineTaskMenuItem";
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
  SidebarMenuSub,
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

interface RoutineItemMenuProps {
  station: StationNode;
  routine: RoutineNode;
}

const RoutineItemMenu = ({ station, routine }: RoutineItemMenuProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const shelfItemManager = useShelfItem();

  const searchedItems =
    shelfItemManager.itemSearch.data?.searchItems?.searchEdges?.map(edge => {
      const item = edge.node as unknown as {
        id: UUID;
        type: GraphQLItemType;
        rootShelf: { name: string };
        parentSubShelf: { name: string };
      };
      return {
        id: item.id,
        type:
          item.type === GraphQLItemType.ItemTypeBlockPack
            ? ItemType.BlockPack
            : ItemType.Material,
        rootShelfName: item.rootShelf.name,
        parentSubShelfName: item.parentSubShelf.name,
      };
    }) ?? [];
  const searchedRoutineTasks = stationRoutineManager.routineTasks.filter(
    routineTask => routineTask.stationId === station.id
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
                  {routine.isOpen ? <ChevronDown /> : <ChevronRight />}
                  <span>{routine.title}</span>
                </SidebarMenuSubButton>
              </CollapsibleTrigger>
            </ContextMenuTrigger>
          )}

          <ContextMenuContent className="min-w-44">
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuGroup>
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
                Open
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Add</ContextMenuLabel>
            <ContextMenuGroup>
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
                  void stationRoutineManager
                    .searchRoutineTags()
                    .catch(error => toast.error(languageManager.tError(error)));
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
                  void stationRoutineManager
                    .searchRoutineTasksByStationId(station.id)
                    .catch(error => toast.error(languageManager.tError(error)));
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
                      .loadMoreRoutineTasks()
                      .catch(error =>
                        toast.error(languageManager.tError(error))
                      );
                  }}
                >
                  {stationRoutineManager.isSearchingRoutineTasks &&
                  searchedRoutineTasks.length === 0 ? (
                    <ContextMenuItem disabled>
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                      Loading
                    </ContextMenuItem>
                  ) : searchedRoutineTasks.length === 0 ? (
                    <ContextMenuItem disabled>No Tasks</ContextMenuItem>
                  ) : (
                    searchedRoutineTasks.map(routineTask => {
                      const isLinked = routine.routineTasks.some(
                        linkedRoutineTask =>
                          linkedRoutineTask.id === routineTask.id
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
                  void shelfItemManager
                    .searchItems({
                      query: "",
                      rootShelfId: null,
                      parentSubShelfId: null,
                    })
                    .catch(error => toast.error(languageManager.tError(error)));
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
                      {searchedItems.map(item => (
                        <ContextMenuItem
                          key={`${item.type}-${item.id}`}
                          onClick={() => {
                            void stationRoutineManager
                              .linkRoutineItem(routine.id, item.id, item.type)
                              .then(() => toast.success("Item connected"))
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
                        </ContextMenuItem>
                      ))}
                    </>
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
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

        {!stationRoutineManager.isRoutineEditing(routine.id) && (
          <CollapsibleContent>
            <SidebarMenuSub>
              {routine.routineTasks.map(routineTask => (
                <RoutineTaskMenuItem
                  key={routineTask.id}
                  routineTask={routineTask}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuSubItem>
    </Collapsible>
  );
};

export default RoutineItemMenu;
