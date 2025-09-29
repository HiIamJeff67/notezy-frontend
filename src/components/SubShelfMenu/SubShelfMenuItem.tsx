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
import { useLanguage, useLoading, useShelf } from "@/hooks";
import { MaxShelfDepth } from "@shared/constants";
import {
  RootShelfNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import { DNDType } from "@shared/types/enums/dndType.enum";
import { CheckIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";

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
  const shelfManager = useShelf();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DNDType.DraggableSubShelf.toString(),
    item: { summary, prev, current, depth },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: DNDType.DraggableSubShelf.toString(),
    drop: (draggedItem: {
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

      shelfManager.moveSubShelf(
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

  const handleRenameRootShelfOnSubmit = useCallback(
    async (subShelfNode: SubShelfNode): Promise<void> => {
      loadingManager.setIsLoading(true);

      try {
        await shelfManager.renameSubShelf(subShelfNode);
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        loadingManager.setIsLoading(false);
      }
    },
    [loadingManager, languageManager, shelfManager]
  );

  return (
    <Collapsible>
      <SidebarMenuItem
        ref={node => {
          drag(drop(node));
        }}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                className="rounded-sm"
                onClick={() => shelfManager.expandSubShelf(current)}
              >
                {current.name}
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() =>
                shelfManager.createSubShelf(
                  summary.root.id,
                  current,
                  "undefined"
                )
              }
            >
              Create an new sub shelf
            </ContextMenuItem>
            <ContextMenuItem onClick={() => {}}>
              Create an new material
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => shelfManager.startRenamingSubShelf(current)}
            >
              Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                shelfManager.deleteSubShelf(prev, current);
              }}
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          <SidebarMenuSub>
            {Object.keys(current.children).length > 0 && (
              <Suspense fallback={<SubShelfMenuItemSkeleton />}>
                {/* this part can be executed before the current sub shelf being expanded */}
                {Object.entries(current.children).map(
                  ([subShelfId, subShelfNode]) => {
                    return (
                      subShelfNode && (
                        <Suspense fallback={<SubShelfMenuItemSkeleton />}>
                          {shelfManager.isSubShelfNodeEditing(subShelfNode) ? (
                            <SidebarMenuItem className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative">
                              <input
                                ref={shelfManager.inputRef}
                                type="text"
                                value={shelfManager.editSubShelfName}
                                className="flex-1 bg-transparent h-6 outline-none caret-foreground overflow-hidden"
                                onChange={e =>
                                  shelfManager.setEditSubShelfName(
                                    e.target.value
                                  )
                                }
                                onKeyDown={async e => {
                                  switch (e.key) {
                                    case "Enter":
                                      await handleRenameRootShelfOnSubmit(
                                        subShelfNode
                                      );
                                    case "Escape":
                                      shelfManager.cancelRenamingSubShelf();
                                  }
                                }}
                                // note that autoFocus doesn't work in this case,
                                // bcs the user clicked context menu trigger before the input element rendering
                              />
                              {shelfManager.isNewSubShelfName() && (
                                <button
                                  onClick={async () =>
                                    await handleRenameRootShelfOnSubmit(
                                      subShelfNode
                                    )
                                  }
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
                      )
                    );
                  }
                )}
              </Suspense>
            )}
            {!current.isExpanded ? (
              <SubShelfMenuItemSkeleton />
            ) : (
              <Suspense fallback={<SubShelfMenuItemSkeleton />}>
                {Object.entries(current.materialNodes).map(
                  ([materialId, materialNode], index) =>
                    materialNode && (
                      <SidebarMenuItem key={index} id={materialId}>
                        <SidebarMenuButton
                          className="rounded-sm"
                          onClick={() => {}}
                        >
                          {materialNode.name}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                )}
              </Suspense>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

export default SubShelfMenuItem;
