import { MaxShelfDepth } from "@shared/constants";
import { DNDType } from "@shared/enums";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import toast from "@shared/lib/toast";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import BlockPackMenu from "@/components/menus/BlockPackMenu/BlockPackMenu";
import BlockPackMenuItemSkeleton from "@/components/menus/BlockPackMenu/BlockPackMenuItemSkeleton";
import MaterialMenu from "@/components/menus/MaterialMenu/MaterialMenu";
import MaterialMenuItemSkeleton from "@/components/menus/MaterialMenu/MaterialMenuItemSkeleton";
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
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { useModal } from "@/hooks/useModal";

interface SubShelfMenuItemProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
  prev: SubShelfNode | null;
  current: SubShelfNode;
  depth: number;
}

const SubShelfMenuItem = ({
  summary,
  root,
  prev,
  current,
  depth,
}: SubShelfMenuItemProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const modalManager = useModal();
  const shelfItemManager = useShelfItem();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DNDType.DraggableSubShelf.toString(),
      item: { summary, prev, current, depth },
      canDrag:
        !shelfItemManager.isAnyRootShelfNodeEditing &&
        !shelfItemManager.isAnySubShelfNodeEditing,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [
      shelfItemManager.isAnyRootShelfNodeEditing,
      shelfItemManager.isAnySubShelfNodeEditing,
    ]
  );

  const [{}, drop] = useDrop(() => ({
    accept: DNDType.DraggableSubShelf.toString(),
    hover: (_, monitor) => {
      if (!monitor.canDrop()) return;
    },
    drop: async (draggedItem: {
      summary: ShelfTreeSummary;
      prev: SubShelfNode | null;
      current: SubShelfNode;
      depth: number;
    }) => {
      if (
        draggedItem.prev === current || // cannot drop on its parent
        draggedItem.current === current || // cannot drop on itself
        SubShelfManipulator.isChildByPath(draggedItem.current, current) // cannot drop on its children
      ) {
        return;
      }

      await shelfItemManager.moveSubShelf(
        draggedItem.prev,
        draggedItem.current,
        root,
        current
      );
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  }));

  if (depth > MaxShelfDepth) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuButton className="rounded-sm text-muted">
          ... (Too deep)
        </SidebarMenuButton>
      </SidebarMenuSubItem>
    );
  }

  const handleCreateMaterial = useCallback(async () => {
    try {
      await shelfItemManager.createMaterial(root.id, current, "new material");
      if (!current.isExpanded) {
        await shelfItemManager.expandSubShelf(root, current);
      }
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  }, [root, current, languageManager, shelfItemManager]);

  const handleCreateBlockPack = useCallback(async () => {
    try {
      await shelfItemManager.createBlockPack(
        root.id,
        current,
        "new block pack"
      );
      if (!current.isExpanded) {
        await shelfItemManager.expandSubShelf(root, current);
      }
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  }, [root, current, languageManager, shelfItemManager]);

  const handleCreateSubShelf = useCallback(async () => {
    try {
      await shelfItemManager.createSubShelf(
        summary.root.id,
        current,
        "new sub shelf"
      );
      if (!current.isExpanded) {
        await shelfItemManager.expandSubShelf(root, current);
      }
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  }, [root, current, languageManager, shelfItemManager]);

  const handleRenameSubShelfOnSubmit = useCallback(
    async () =>
      await loadingManager.startAsyncTransactionLoading(
        async () =>
          await shelfItemManager
            .renameEditingSubShelf()
            .catch(error => toast.error(languageManager.tError(error)))
      ),
    [loadingManager, languageManager, shelfItemManager]
  );

  return (
    <Collapsible open={current.isOpen}>
      <SidebarMenuItem
        ref={node => {
          drag(node);
        }}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                ref={node => {
                  drop(node);
                }}
                className="w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden"
                onClick={async () => {
                  shelfItemManager.toggleSubShelf(current);
                  if (!current.isExpanded) {
                    await shelfItemManager.expandSubShelf(root, current);
                  }
                }}
              >
                {current.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                <span>{current.name}</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Add</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuSub>
                <ContextMenuSubTrigger>Items</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem onClick={handleCreateMaterial}>
                    Material
                  </ContextMenuItem>
                  <ContextMenuItem onClick={handleCreateBlockPack}>
                    Block Pack
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuItem onClick={handleCreateSubShelf}>
                Sub Shelf
              </ContextMenuItem>
            </ContextMenuGroup>
            <ContextMenuSeparator />
            <ContextMenuLabel>Edit</ContextMenuLabel>
            <ContextMenuGroup>
              <ContextMenuItem
                onClick={() =>
                  shelfItemManager.startRenamingSubShelfNode(current)
                }
              >
                Rename
              </ContextMenuItem>
              <ContextMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  modalManager.open("DeleteShelfItemDialog", {
                    dialogHeader: "Delete a sub shelf",
                    dialogDescription: `Are you sure about deleting the sub shelf of "${current.name}" ? To delete it, please type the keyword of "DELETE" in the below input area.`,
                    confirmKeyword: "DELETE",
                    inputPlaceholder: `Type "DELETE" here`,
                    onDelete: async () =>
                      await loadingManager.startAsyncTransactionLoading(
                        async () => {
                          await shelfItemManager
                            .deleteSubShelf(prev, current)
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
          <SidebarMenuSub className="w-full">
            {!current.isExpanded ? (
              <>
                <SubShelfMenuItemSkeleton number={1} />
                {/* <MaterialMenuItemSkeleton number={1} /> */}
                {/* <BlockPackMenuItemSkeleton number={1} /> */}
              </>
            ) : (
              <>
                {Object.keys(current.children).length > 0 &&
                  Object.entries(current.children).map(
                    ([subShelfId, subShelfNode]) => {
                      return (
                        <Suspense
                          fallback={<SubShelfMenuItemSkeleton number={1} />}
                          key={subShelfId}
                        >
                          {shelfItemManager.isSubShelfNodeEditing(
                            subShelfNode.id
                          ) ? (
                            <SidebarMenuItem
                              key={subShelfId}
                              className="relative flex items-center justify-end rounded-sm border border-foreground bg-muted px-2 py-1"
                            >
                              <input
                                ref={shelfItemManager.inputRef}
                                type="text"
                                value={shelfItemManager.editSubShelfName}
                                className="h-6 min-w-0 flex-1 overflow-hidden bg-transparent pr-6 outline-none"
                                onChange={e =>
                                  shelfItemManager.setEditSubShelfName(
                                    e.target.value
                                  )
                                }
                                onKeyDown={async e => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    await handleRenameSubShelfOnSubmit();
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    shelfItemManager.cancelRenamingSubShelfNode();
                                  }
                                }}
                                // note that autoFocus doesn't work in this case,
                                // bcs the user clicked context menu trigger before the input element rendering
                              />
                              {shelfItemManager.isNewSubShelfName() && (
                                <button
                                  type="button"
                                  className="absolute right-1 flex size-5 items-center justify-center rounded-sm hover:bg-primary/60"
                                  onMouseDown={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={async e => {
                                    e.stopPropagation();
                                    await handleRenameSubShelfOnSubmit();
                                  }}
                                  aria-label="Save sub shelf name"
                                >
                                  <CheckIcon className="size-4" />
                                </button>
                              )}
                            </SidebarMenuItem>
                          ) : (
                            <SubShelfMenuItem
                              key={subShelfId}
                              summary={summary}
                              root={root}
                              prev={current}
                              current={subShelfNode}
                              depth={depth + 1}
                            />
                          )}
                        </Suspense>
                      );
                    }
                  )}
                <MaterialMenu parent={current} />
                <BlockPackMenu parent={current} />
              </>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default SubShelfMenuItem;
