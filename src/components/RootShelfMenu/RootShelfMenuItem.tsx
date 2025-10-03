import CheckIcon from "@/components/icons/CheckIcon";
import ModifyDotIcon from "@/components/icons/ModifyDotIcon";
import RootShelfMenuItemSkeleton from "@/components/RootShelfMenu/RootShelfMenuItemSkeleton";
import SubShelfMenu from "@/components/SubShelfMenu/SubShelfMenu";
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { SearchRootShelfEdge } from "@/graphql/generated/graphql";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import { ShelfTreeSummary, SubShelfNode } from "@shared/lib/shelfMaterialNodes";
import { DNDType } from "@shared/types/enums/dndType.enum";
import { Suspense, useCallback } from "react";
import { useDrop } from "react-dnd";
import toast from "react-hot-toast";
import EmptyShelfIcon from "../icons/EmptyShelfIcon";
import ShelfIcon from "../icons/ShelfIcon";

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
  const shelfMaterialManager = useShelfMaterial();

  const summary = shelfMaterialManager.expandedShelves.get(
    rootShelfEdge.node.id
  );
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

      await shelfMaterialManager.moveSubShelf(
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

  const handleRenameRootShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsLoading(true);

    try {
      await shelfMaterialManager.renameEditingRootShelf();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      loadingManager.setIsLoading(false);
    }
  }, [loadingManager, languageManager, shelfMaterialManager]);

  return (
    <Suspense fallback={<RootShelfMenuItemSkeleton />} key={index}>
      <Collapsible>
        <SidebarMenuItem>
          <ContextMenu>
            {shelfMaterialManager.isRootShelfNodeEditing(summary.root) ? (
              <div className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative">
                <input
                  ref={shelfMaterialManager.inputRef}
                  type="text"
                  value={shelfMaterialManager.editRootShelfNodeName}
                  className="flex-1 bg-transparent h-6 outline-none caret-foreground overflow-hidden"
                  onChange={e =>
                    shelfMaterialManager.setEditRootShelfNodeName(
                      e.target.value
                    )
                  }
                  onKeyDown={async e => {
                    if (e.key === "Enter") {
                      await handleRenameRootShelfOnSubmit();
                    } else if (e.key === "Escape") {
                      shelfMaterialManager.cancelRenamingRootShelfNode();
                    }
                  }}
                  // note that autoFocus doesn't work in this case,
                  // bcs the user clicked context menu trigger before the input element rendering
                />
                {shelfMaterialManager.isNewRootShelfNodeName() && (
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
                    className="w-full rounded-sm border-2 border-secondary hover:border-transparent 
                        whitespace-nowrap text-ellipsis overflow-hidden"
                    onClick={async () => {
                      await shelfMaterialManager.expandRootShelf(
                        rootShelfEdge.node
                      );
                      shelfMaterialManager.toggleRootShelf(summary.root);
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
            {!shelfMaterialManager.isNewRootShelfNodeName() &&
              summary.hasChanged && (
                <SidebarMenuAction className="hover:bg-primary/60 p-0.5">
                  <ModifyDotIcon className="max-w-3.5 max-h-3.5" />
                </SidebarMenuAction>
              )}
            <ContextMenuContent>
              <ContextMenuItem
                onClick={async () => {
                  await shelfMaterialManager.createSubShelf(
                    summary.root.id,
                    null,
                    "undefined"
                  );
                }}
              >
                Create an new shelf
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => {
                  shelfMaterialManager.startRenamingRootShelfNode(summary.root);
                }}
              >
                Rename
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={async () => {
                  await shelfMaterialManager.deleteRootShelf(summary.root);
                }}
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
    </Suspense>
  );
};

export default RootShelfMenuItem;
