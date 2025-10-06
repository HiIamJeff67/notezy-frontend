import CheckIcon from "@/components/icons/CheckIcon";
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
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import { MaxShelfDepth } from "@shared/constants";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import { DNDType } from "@shared/types/enums/dndType.enum";
import {
  RootShelfNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/types/shelfMaterialNodes";
import { Suspense, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import MaterialMenu from "../MaterialMenu/MaterialMenu";

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
  const shelfMaterialManager = useShelfMaterial();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DNDType.DraggableSubShelf.toString(),
    item: { summary, prev, current, depth },
    canDrag:
      !shelfMaterialManager.isAnyRootShelfNodeEditing &&
      !shelfMaterialManager.isAnySubShelfNodeEditing,
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

      await shelfMaterialManager.moveSubShelf(
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

  const handleRenameSubShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsLoading(true);

    try {
      await shelfMaterialManager.renameEditingSubShelf();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      loadingManager.setIsLoading(false);
    }
  }, [loadingManager, languageManager, shelfMaterialManager]);

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
                    await shelfMaterialManager.expandSubShelf(root, current);
                  }
                  shelfMaterialManager.toggleSubShelf(current);
                }}
              >
                {current.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                <span>{current.name}</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={async () => {
                await shelfMaterialManager.createSubShelf(
                  summary.root.id,
                  current,
                  "undefined"
                );
                if (!current.isExpanded) {
                  await shelfMaterialManager.expandSubShelf(root, current);
                }
              }}
            >
              Create an new sub shelf
            </ContextMenuItem>
            <ContextMenuItem
              onClick={async () => {
                await shelfMaterialManager.createTextbookMaterial(
                  root.id,
                  current,
                  "undefined"
                );
                if (!current.isExpanded) {
                  await shelfMaterialManager.expandSubShelf(root, current);
                }
              }}
            >
              Create an new material
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() =>
                shelfMaterialManager.startRenamingSubShelfNode(current)
              }
            >
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={async () => {
                await shelfMaterialManager.deleteSubShelf(prev, current);
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
                        {shelfMaterialManager.isSubShelfNodeEditing(
                          subShelfNode
                        ) ? (
                          <SidebarMenuItem
                            key={subShelfId}
                            className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative"
                          >
                            <input
                              ref={shelfMaterialManager.inputRef}
                              type="text"
                              value={shelfMaterialManager.editSubShelfNodeName}
                              className="flex-1 bg-transparent w-full h-6 outline-none caret-foreground overflow-hidden"
                              onChange={e =>
                                shelfMaterialManager.setEditSubShelfNodeName(
                                  e.target.value
                                )
                              }
                              onKeyDown={async e => {
                                switch (e.key) {
                                  case "Enter":
                                    await handleRenameSubShelfOnSubmit();
                                  case "Escape":
                                    shelfMaterialManager.cancelRenamingSubShelfNode();
                                }
                              }}
                              // note that autoFocus doesn't work in this case,
                              // bcs the user clicked context menu trigger before the input element rendering
                            />
                            {shelfMaterialManager.isNewSubShelfNodeName() && (
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
            <MaterialMenu summary={summary} parent={current} />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default SubShelfMenuItem;
