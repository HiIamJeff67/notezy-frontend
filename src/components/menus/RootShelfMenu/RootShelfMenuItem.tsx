import { SearchRootShelfEdge } from "@shared/api/graphql/generated/graphql";
import { DNDType } from "@shared/enums";
import toast from "@shared/lib/toast";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { CheckIcon, SquareDotIcon } from "lucide-react";
import { useCallback } from "react";
import { useDrop } from "react-dnd";
import EmptyShelfIcon from "@/components/icons/EmptyShelfIcon";
import ShelfIcon from "@/components/icons/ShelfIcon";
import RootShelfMenuItemSkeleton from "@/components/menus/RootShelfMenu/RootShelfMenuItemSkeleton";
import SubShelfMenu from "@/components/menus/SubShelfMenu/SubShelfMenu";
import SubShelfMenuItemSkeleton from "@/components/menus/SubShelfMenu/SubShelfMenuItemSkeleton";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { useModal } from "@/hooks/useModal";

interface RootShelfMenuItemProps {
  rootShelfEdge: SearchRootShelfEdge;
  index: number;
}

const RootShelfMenuItem = ({
  rootShelfEdge,
  index,
}: RootShelfMenuItemProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const modalManager = useModal();
  const shelfItemManager = useShelfItem();

  const summary = shelfItemManager.expandedShelves.get(rootShelfEdge.node.id);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DNDType.DraggableSubShelf.toString(),
    drop: async (draggedItem: {
      summary: ShelfTreeSummary;
      prev: SubShelfNode | null;
      current: SubShelfNode;
      depth: number;
    }) => {
      if (!summary) {
        return;
      }

      await shelfItemManager.moveSubShelf(
        draggedItem.prev,
        draggedItem.current,
        summary.root,
        null
      );
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleRenameRootShelfOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(
        async () =>
          await shelfItemManager
            .renameEditingRootShelf()
            .catch(error => toast.error(languageManager.tError(error)))
      ),
    [loadingManager, languageManager, shelfItemManager]
  );

  if (!summary) return <RootShelfMenuItemSkeleton key={index} />;

  return (
    <Collapsible open={summary.root.isOpen}>
      <SidebarMenuItem>
        <ContextMenu>
          {shelfItemManager.isRootShelfNodeEditing(summary.root.id) ? (
            <div className="relative flex items-center justify-end rounded-sm border-none bg-muted px-2 py-1">
              <input
                ref={shelfItemManager.inputRef}
                type="text"
                value={shelfItemManager.editRootShelfName}
                className="h-6 min-w-0 flex-1 overflow-hidden bg-transparent pr-6 outline-none"
                onChange={e =>
                  shelfItemManager.setEditRootShelfName(e.target.value)
                }
                onKeyDown={async e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    await handleRenameRootShelfOnSubmit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    shelfItemManager.cancelRenamingRootShelfNode();
                  }
                }}
                // note that autoFocus doesn't work in this case,
                // bcs the user clicked context menu trigger before the input element rendering
              />
              {shelfItemManager.isNewRootShelfName() && (
                <button
                  type="button"
                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={async e => {
                    e.stopPropagation();
                    await handleRenameRootShelfOnSubmit();
                  }}
                  aria-label="Save root shelf name"
                >
                  <CheckIcon className="size-4" />
                </button>
              )}
            </div>
          ) : (
            <ContextMenuTrigger asChild>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  ref={node => {
                    drop(node);
                  }}
                  className="w-full rounded-sm
                        whitespace-nowrap text-ellipsis overflow-hidden"
                  onClick={async () => {
                    shelfItemManager.toggleRootShelf(summary.root);
                    if (!summary.root.isExpanded) {
                      await shelfItemManager.expandRootShelf(
                        rootShelfEdge.node
                      );
                    }
                  }}
                >
                  {summary.root.isOpen ? (
                    <EmptyShelfIcon size={16} />
                  ) : (
                    <ShelfIcon size={16} />
                  )}
                  <span>{summary.root.name}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </ContextMenuTrigger>
          )}
          {!shelfItemManager.isNewRootShelfName() && summary.hasChanged && (
            <SidebarMenuAction className="bg-transparent hover:bg-transparent p-0.5 flex justify-center items-center">
              <SquareDotIcon className="max-w-4 max-h-4" />
            </SidebarMenuAction>
          )}
          <ContextMenuContent>
            <ContextMenuLabel>Add</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={async () =>
                  await shelfItemManager.createSubShelf(
                    summary.root.id,
                    null,
                    "new sub shelf"
                  )
                }
              >
                Sub Shelf
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  shelfItemManager.startRenamingRootShelfNode(summary.root)
                }
              >
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteShelfItemDialog", {
                    dialogHeader: "Delete a root shelf",
                    dialogDescription: `Are you sure about deleting the root shelf of "${summary.root.name}" ? To delete it, please type the keyword of "DELETE" in the below input area.`,
                    confirmKeyword: "DELETE",
                    inputPlaceholder: `Type "DELETE" here`,
                    onDelete: async () =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () => {
                          await shelfItemManager
                            .deleteRootShelf(summary.root)
                            .catch(error =>
                              toast.error(languageManager.tError(error))
                            );
                        }
                      ),
                    onCancel: modalManager.close,
                  })
                }
              >
                Delete
              </ContextMenuItem>
            </ContextMenuGroup>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          <SidebarMenuSub>
            {!summary.root.isExpanded ? (
              <SubShelfMenuItemSkeleton />
            ) : (
              <SubShelfMenu summary={summary} root={summary.root} />
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default RootShelfMenuItem;
