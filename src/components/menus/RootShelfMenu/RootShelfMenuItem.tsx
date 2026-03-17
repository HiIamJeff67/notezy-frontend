import CheckIcon from "@/components/icons/CheckIcon";
import EmptyShelfIcon from "@/components/icons/EmptyShelfIcon";
import ModifyDotIcon from "@/components/icons/ModifyDotIcon";
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
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { SearchRootShelfEdge } from "@/graphql/generated/graphql";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { useModal } from "@/hooks/useModal";
import { DNDType } from "@shared/enums/dndType.enum";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { useCallback } from "react";
import { useDrop } from "react-dnd";
import toast from "react-hot-toast";

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
  if (!summary) return <RootShelfMenuItemSkeleton key={index} />;

  // the hook should be place before break
  // since we have to make sure the render order of the hooks is static
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

  return (
    <Collapsible>
      <SidebarMenuItem>
        <ContextMenu>
          {shelfItemManager.isRootShelfNodeEditing(summary.root.id) ? (
            <div className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-none border-foreground relative">
              <input
                ref={shelfItemManager.inputRef}
                type="text"
                value={shelfItemManager.editRootShelfNodeName}
                className="flex-1 bg-transparent h-6 outline-none overflow-hidden"
                onChange={e =>
                  shelfItemManager.setEditRootShelfNodeName(e.target.value)
                }
                onKeyDown={async e => {
                  if (e.key === "Enter") {
                    await handleRenameRootShelfOnSubmit();
                  } else if (e.key === "Escape") {
                    shelfItemManager.cancelRenamingRootShelfNode();
                  }
                }}
                // note that autoFocus doesn't work in this case,
                // bcs the user clicked context menu trigger before the input element rendering
              />
              {shelfItemManager.isNewRootShelfNodeName() && (
                <button
                  onClick={async e => {
                    await handleRenameRootShelfOnSubmit();
                    e.stopPropagation();
                  }}
                  className="rounded hover:bg-primary/60 absolute w-4 h-4"
                  onMouseDown={e => e.stopPropagation()}
                >
                  <CheckIcon className="w-full h-full" />
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
                  className="w-full rounded-sm border-1 border-secondary hover:border-transparent 
                        whitespace-nowrap text-ellipsis overflow-hidden"
                  onClick={async () => {
                    shelfItemManager.toggleRootShelf(summary.root);
                    await shelfItemManager.expandRootShelf(rootShelfEdge.node);
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
          {!shelfItemManager.isNewRootShelfNodeName() && summary.hasChanged && (
            <SidebarMenuAction className="hover:bg-primary/60 p-0.5">
              <ModifyDotIcon className="max-w-3.5 max-h-3.5" />
            </SidebarMenuAction>
          )}
          <ContextMenuContent>
            <ContextMenuItem
              onClick={async () =>
                await shelfItemManager.createSubShelf(
                  summary.root.id,
                  null,
                  "new sub shelf"
                )
              }
            >
              Create Sub Shelf
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                shelfItemManager.startRenamingRootShelfNode(summary.root)
              }
            >
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                modalManager.open("DeleteShelfItemDialog", {
                  dialogHeader:
                    "Are you sure you want to delete this root shelf ?",
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
