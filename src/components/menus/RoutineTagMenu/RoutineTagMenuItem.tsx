import toast from "@shared/lib/toast";
import type { RoutineTagNode } from "@shared/types/routineTagNode.type";
import {
  CheckIcon,
  ChevronDown,
  ChevronRight,
  Link2,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useCallback } from "react";
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage, useLoading, useModal, useRoutine } from "@/hooks";

interface RoutineTagMenuItemProps {
  routineTag: RoutineTagNode;
}

const RoutineTagMenuItem = ({ routineTag }: RoutineTagMenuItemProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();
  const modalManager = useModal();
  const routineManager = useRoutine();
  const availableRoutines = routineManager.routines;

  const handleRenameRoutineTagOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        await routineManager
          .renameEditingRoutineTag()
          .catch(error => toast.error(languageManager.tError(error)));
      }),
    [languageManager, loadingManager, routineManager]
  );

  return (
    <Collapsible open={routineTag.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {routineManager.isRoutineTagEditing(routineTag.id) ? (
            <div className="relative flex h-8 items-center justify-end rounded-sm bg-muted px-2">
              <input
                ref={routineManager.routineTagNameInputRef}
                type="text"
                value={routineManager.editRoutineTagName}
                maxLength={128}
                className="h-6 min-w-0 flex-1 bg-transparent pr-6 text-sm outline-none"
                onChange={event =>
                  routineManager.setEditRoutineTagName(
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
                    routineManager.cancelRenamingRoutineTag();
                  }
                }}
              />
              {routineManager.isNewRoutineTagName() && (
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
            <ContextMenuTrigger asChild>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className="w-full rounded-sm"
                  onClick={() => {
                    routineManager.selectRoutineTag(routineTag.id);
                    void routineManager
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
          )}

          <ContextMenuContent className="min-w-40">
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() => routineManager.selectRoutineTag(routineTag.id)}
              >
                <SquarePen className="mr-2 size-4" />
                Open
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  routineManager.startRenamingRoutineTag(routineTag)
                }
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
                    <ContextMenuItem disabled>No routines</ContextMenuItem>
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
                            void routineManager
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
            <ContextMenuGroup>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteRoutineTagDialog", {
                    routineTagId: routineTag.id,
                    routineTagName: routineTag.name,
                    onDeleted: async () => {
                      if (
                        routineManager.selectedRoutineTagId === routineTag.id
                      ) {
                        routineManager.selectRoutineTag(null);
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

        {!routineManager.isRoutineTagEditing(routineTag.id) && (
          <>
            <SidebarMenuBadge>{routineTag.routineCount}</SidebarMenuBadge>
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
