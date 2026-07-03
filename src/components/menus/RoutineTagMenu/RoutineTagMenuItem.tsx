import toast from "@shared/lib/toast";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  Copy,
  Link2,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
import ContextMenuCopyItems from "@/components/commons/ContextMenuCopyItems/ContextMenuCopyItems";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage, useLoading, useModal, useStationRoutine } from "@/hooks";

interface RoutineTagMenuItemProps {
  routineTag: RoutineTagNode;
}

const RoutineTagMenuItem = ({ routineTag }: RoutineTagMenuItemProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const stationRoutineManager = useStationRoutine();
  const availableRoutines = stationRoutineManager.routines;

  const handleRenameRoutineTagOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await stationRoutineManager
          .renameEditingRoutineTag()
          .catch(error => toast.error(languageManager.tError(error)));
      }),
    [languageManager, loadingManager, stationRoutineManager]
  );

  return (
    <Collapsible open={routineTag.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {stationRoutineManager.isRoutineTagEditing(routineTag.id) ? (
            <div className="relative flex h-8 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={stationRoutineManager.routineTagNameInputRef}
                type="text"
                value={stationRoutineManager.editRoutineTagName}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm outline-none"
                onChange={event =>
                  stationRoutineManager.setEditRoutineTagName(
                    event.currentTarget.value
                  )
                }
                onKeyDown={async event => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.stopPropagation();
                    await handleRenameRoutineTagOnSubmit();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    stationRoutineManager.cancelRenamingRoutineTag();
                  }
                }}
              />
              {stationRoutineManager.isNewRoutineTagName() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={async event => {
                    event.stopPropagation();
                    await handleRenameRoutineTagOnSubmit();
                  }}
                  aria-label="Save routine tag name"
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
                      className="w-full rounded-sm"
                      onClick={() => {
                        stationRoutineManager.selectRoutineTag(routineTag.id);
                        void stationRoutineManager
                          .toggleRoutineTag(routineTag.id)
                          .catch(error =>
                            toast.error(languageManager.tError(error))
                          );
                      }}
                    >
                      {routineTag.isOpen ? <ChevronDown /> : <ChevronRight />}
                      <span
                        className="size-3 shrink-0 rounded-[2px] border border-border/60"
                        style={{ backgroundColor: routineTag.color }}
                      />
                      {routineTag.icon && (
                        <span className="shrink-0 select-none text-sm">
                          {routineTag.icon}
                        </span>
                      )}
                      <span>{routineTag.name}</span>
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
                  title={routineTag.name}
                  subtitle="Routine Tag"
                  id={routineTag.id}
                  rows={[
                    {
                      field: "Color",
                      value: (
                        <span className="inline-flex min-w-0 items-center justify-end gap-1.5">
                          <span
                            className="size-2.5 shrink-0 rounded-[2px] border border-border/60"
                            style={{ backgroundColor: routineTag.color }}
                          />
                          <span className="truncate">{routineTag.color}</span>
                        </span>
                      ),
                    },
                    { field: "Icon", value: routineTag.icon ?? "None" },
                    { field: "Routines", value: routineTag.routineCount },
                    {
                      field: "Updated",
                      value: new Date(
                        routineTag.updatedAt
                      ).toLocaleDateString(),
                    },
                  ]}
                />
              </HoverCardContent>
            </HoverCard>
          )}

          <ContextMenuContent className="min-w-40">
            <ContextMenuLabel>View</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() => {
                  stationRoutineManager.selectRoutineTag(routineTag.id);
                  stationRoutineManager.openInspector({
                    type: "routineTag",
                    id: routineTag.id,
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
                    .duplicateRoutineTag(routineTag.id)
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <Copy className="mr-2 size-4" />
                Duplicate
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Link</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuSub
                onOpenChange={open => {
                  if (!open) return;
                  void stationRoutineManager
                    .searchRoutines()
                    .catch(error => toast.error(languageManager.tError(error)));
                }}
              >
                <ContextMenuSubTrigger>
                  <Link2 className="mr-2 size-4" />
                  Routines
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {availableRoutines.length === 0 ? (
                    <ContextMenuItem disabled>No Routines</ContextMenuItem>
                  ) : (
                    availableRoutines.map(routine => {
                      const isLinked = routineTag.routines.some(
                        linkedRoutine => linkedRoutine.id === routine.id
                      );
                      return (
                        <ContextMenuItem
                          key={routine.id}
                          disabled={isLinked}
                          onClick={() => {
                            void stationRoutineManager
                              .linkRoutineTag(routine.id, routineTag.id)
                              .catch(error =>
                                toast.error(languageManager.tError(error))
                              );
                          }}
                        >
                          {routine.title}
                        </ContextMenuItem>
                      );
                    })
                  )}
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuCopyItems id={routineTag.id} name={routineTag.name} />
              <ContextMenuItem
                onClick={() =>
                  stationRoutineManager.startRenamingRoutineTag(routineTag)
                }
              >
                <Pencil className="mr-2 size-4" />
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteRoutineTagDialog", {
                    routineTagId: routineTag.id,
                    routineTagName: routineTag.name,
                  })
                }
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>

        {!stationRoutineManager.isRoutineTagEditing(routineTag.id) && (
          <>
            {routineTag.routineCount > 0 && (
              <SidebarMenuBadge>{routineTag.routineCount}</SidebarMenuBadge>
            )}
            <CollapsibleContent>
              <RoutineMenu routines={routineTag.routines} />
            </CollapsibleContent>
          </>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default RoutineTagMenuItem;
