import CheckIcon from "@/components/icons/CheckIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import MaterialMenu from "@/components/MaterialMenu/MaterialMenu";
import SubShelfMenuItemSkeleton from "@/components/SubShelfMenu/SubShelfMenuItemSkeleton";
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
import { MaxShelfDepth } from "@shared/constants";
import { DNDType } from "@shared/enums/dndType.enum";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { Suspense, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";
import BlockPackMenu from "../BlockPackMenu/BlockPackMenu";

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
  const shelfItemManager = useShelfItem();

  console.log(current);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DNDType.DraggableSubShelf.toString(),
    item: { summary, prev, current, depth },
    canDrag:
      !shelfItemManager.isAnyRootShelfNodeEditing &&
      !shelfItemManager.isAnySubShelfNodeEditing,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{}, drop] = useDrop(() => ({
    accept: DNDType.DraggableSubShelf.toString(),
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
    <SidebarMenuSubItem>
      <SidebarMenuButton className="rounded-sm text-muted">
        ... (Too deep)
      </SidebarMenuButton>
    </SidebarMenuSubItem>;
  }

  const handleCreateTextbookMaterial = useCallback(async () => {
    try {
      await shelfItemManager.createTextbookMaterial(
        root.id,
        current,
        "new textbook"
      );
      if (!current.isExpanded) {
        await shelfItemManager.expandSubShelf(root, current);
      }
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  }, [root, current, languageManager, shelfItemManager]);

  const handleCreateNotebookMaterial = useCallback(async () => {
    try {
      await shelfItemManager.createNotebookMaterial(
        root.id,
        current,
        "new notebook"
      );
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

  const handleRenameSubShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.startAsyncTransactionLoading(async () => {
      try {
        await shelfItemManager.renameEditingSubShelf();
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    });
  }, [loadingManager, languageManager, shelfItemManager]);

  return (
    <Collapsible>
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
                  if (!current.isExpanded) {
                    await shelfItemManager.expandSubShelf(root, current);
                  }
                  shelfItemManager.toggleSubShelf(current);
                }}
              >
                {current.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                <span>{current.name}</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Create Material</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem
                  onClick={async () => await handleCreateTextbookMaterial()}
                >
                  Textbook
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={async () => await handleCreateNotebookMaterial()}
                >
                  Notebook
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              onClick={async () => await handleCreateBlockPack()}
            >
              Create Block Pack
            </ContextMenuItem>
            <ContextMenuItem onClick={async () => await handleCreateSubShelf()}>
              Create Sub Shelf
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                shelfItemManager.startRenamingSubShelfNode(current)
              }
            >
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={async () => {
                await shelfItemManager.deleteSubShelf(prev, current);
              }}
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          <SidebarMenuSub className="w-full">
            {Object.keys(current.children).length > 0 && (
              <Suspense fallback={<SubShelfMenuItemSkeleton />}>
                {/* this part can be executed before the current sub shelf being expanded */}
                {Object.entries(current.children).map(
                  ([subShelfId, subShelfNode]) => {
                    return (
                      <Suspense
                        fallback={<SubShelfMenuItemSkeleton />}
                        key={subShelfId}
                      >
                        {shelfItemManager.isSubShelfNodeEditing(
                          subShelfNode.id
                        ) ? (
                          <SidebarMenuItem
                            key={subShelfId}
                            className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative"
                          >
                            <input
                              ref={shelfItemManager.inputRef}
                              type="text"
                              value={shelfItemManager.editSubShelfNodeName}
                              className="flex-1 bg-transparent w-full h-6 outline-none overflow-hidden"
                              onChange={e =>
                                shelfItemManager.setEditSubShelfNodeName(
                                  e.target.value
                                )
                              }
                              onKeyDown={async e => {
                                switch (e.key) {
                                  case "Enter":
                                    await handleRenameSubShelfOnSubmit();
                                  case "Escape":
                                    shelfItemManager.cancelRenamingSubShelfNode();
                                }
                              }}
                              // note that autoFocus doesn't work in this case,
                              // bcs the user clicked context menu trigger before the input element rendering
                            />
                            {shelfItemManager.isNewSubShelfNodeName() && (
                              <button
                                onClick={async e => {
                                  await handleRenameSubShelfOnSubmit();
                                  e.stopPropagation();
                                }}
                                className="rounded hover:bg-primary/60 absolute w-4 h-4"
                                onMouseDown={e => e.stopPropagation()}
                              >
                                <CheckIcon className="w-full h-full" />
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
              </Suspense>
            )}
            <MaterialMenu parent={current} />
            <BlockPackMenu parent={current} />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default SubShelfMenuItem;
