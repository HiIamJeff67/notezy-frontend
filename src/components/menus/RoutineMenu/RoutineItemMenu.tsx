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
  useRoutine,
  useShelfItem,
} from "@/hooks";

interface RoutineItemMenuProps {
  station: StationNode;
  routine: RoutineNode;
}

const RoutineItemMenu = ({ station, routine }: RoutineItemMenuProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const routineManager = useRoutine();
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

  const handleRenameRoutineOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await routineManager
          .renameEditingRoutine()
          .catch(error => toast.error(languageManager.tError(error)));
      }),
    [languageManager, loadingManager, routineManager]
  );

  return (
    <Collapsible open={routine.isOpen}>
      <SidebarMenuSubItem>
        <ContextMenu>
          {routineManager.isRoutineEditing(routine.id) ? (
            <div className="relative flex h-7 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={routineManager.routineTitleInputRef}
                type="text"
                value={routineManager.editRoutineTitle}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm outline-none"
                onChange={event =>
                  routineManager.setEditRoutineTitle(event.currentTarget.value)
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameRoutineOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    routineManager.cancelRenamingRoutine();
                  }
                }}
              />
              {routineManager.isNewRoutineTitle() && (
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
                  isActive={routineManager.selectedRoutineId === routine.id}
                  className="cursor-pointer select-none"
                  onClick={() => {
                    routineManager.selectStation(station.id);
                    routineManager.selectRoutine(routine.id);
                    void routineManager
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
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() => {
                  routineManager.selectStation(station.id);
                  routineManager.selectRoutine(routine.id);
                }}
              >
                <SquarePen className="mr-2 size-4" />
                Open
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => routineManager.startRenamingRoutine(routine)}
              >
                <Pencil className="mr-2 size-4" />
                Rename
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Link</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  void routineManager
                    .searchRoutineTags()
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <ContextMenuSubTrigger>
                  <Tags className="mr-2 size-4" />
                  Tags
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {routineManager.routineTags.length === 0 ? (
                    <ContextMenuItem disabled>No tags</ContextMenuItem>
                  ) : (
                    routineManager.routineTags.map(routineTag => {
                      const isLinked = routine.routineTagIds.includes(
                        routineTag.id
                      );
                      return (
                        <ContextMenuCheckboxItem
                          key={routineTag.id}
                          checked={isLinked}
                          onSelect={event => event.preventDefault()}
                          onCheckedChange={() => {
                            void routineManager
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
              <ContextMenuItem
                onClick={() =>
                  modalManager.open("CreateRoutineTaskDialog", {
                    stationId: station.id,
                    stationName: station.name,
                    onCreated: async routineTaskId => {
                      await routineManager.linkRoutineTask(
                        routine.id,
                        routineTaskId
                      );
                      routine.isOpen = true;
                    },
                  })
                }
              >
                <ClipboardList className="mr-2 size-4" />
                Tasks
              </ContextMenuItem>
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
                <ContextMenuSubContent className="max-h-80 min-w-64 overflow-y-auto">
                  {shelfItemManager.itemSearch.loading &&
                  searchedItems.length === 0 ? (
                    <ContextMenuItem disabled>
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                      Loading
                    </ContextMenuItem>
                  ) : searchedItems.length === 0 ? (
                    <ContextMenuItem disabled>No items</ContextMenuItem>
                  ) : (
                    <>
                      {searchedItems.map(item => (
                        <ContextMenuItem
                          key={`${item.type}-${item.id}`}
                          onClick={() => {
                            void routineManager
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
                      {shelfItemManager.itemSearch.data?.searchItems
                        ?.searchPageInfo?.hasNextPage && (
                        <ContextMenuItem
                          disabled={shelfItemManager.itemSearch.loading}
                          onSelect={event => {
                            event.preventDefault();
                            void shelfItemManager
                              .loadMoreItems()
                              .catch(error =>
                                toast.error(languageManager.tError(error))
                              );
                          }}
                        >
                          <PackagePlus className="mr-2 size-4" />
                          More
                        </ContextMenuItem>
                      )}
                    </>
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuGroup>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteRoutineDialog", {
                    routineId: routine.id,
                    routineTitle: routine.title,
                    onDeleted: async () => {
                      if (routineManager.selectedRoutineId === routine.id) {
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

        {!routineManager.isRoutineEditing(routine.id) && (
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
