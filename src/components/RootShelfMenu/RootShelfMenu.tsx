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
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelf } from "@/hooks";
import { RootShelfNode } from "@shared/lib/shelfMaterialNodes";
import { CheckIcon, FolderDotIcon } from "lucide-react";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";

const RootShelfMenu = () => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfManager = useShelf();

  const handleRenameRootShelfOnSubmit = useCallback(
    async (rootShelfNode: RootShelfNode): Promise<void> => {
      loadingManager.setIsLoading(true);

      try {
        await shelfManager.renameRootShelf(rootShelfNode);
      } catch (error) {
        toast.error(languageManager.tError(error));
      } finally {
        loadingManager.setIsLoading(false);
      }
    },
    [loadingManager, languageManager, shelfManager]
  );

  return (
    <SidebarMenu>
      {shelfManager.rootShelfEdges.map((edge, index) => {
        const summary = shelfManager.expandedShelves.get(edge.node.id);

        return summary === undefined ? ( // render the skeleton if the summary is still generating
          <RootShelfMenuItemSkeleton key={index} />
        ) : (
          <Suspense fallback={<RootShelfMenuItemSkeleton />} key={index}>
            <Collapsible>
              <SidebarMenuItem>
                <ContextMenu>
                  {shelfManager.isRootShelfNodeEditing(summary.root) ? (
                    <div className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative">
                      <input
                        ref={shelfManager.inputRef}
                        type="text"
                        value={shelfManager.editRootShelfName}
                        className="flex-1 bg-transparent h-6 outline-none caret-foreground overflow-hidden"
                        onChange={e =>
                          shelfManager.setEditRootShelfName(e.target.value)
                        }
                        onKeyDown={async e => {
                          if (e.key === "Enter") {
                            await handleRenameRootShelfOnSubmit(summary.root);
                          } else if (e.key === "Escape") {
                            shelfManager.cancelRenamingRootShelf();
                          }
                        }}
                        // note that autoFocus doesn't work in this case,
                        // bcs the user clicked context menu trigger before the input element rendering
                      />
                      {shelfManager.isNewRootShelfName() && (
                        <button
                          onClick={() =>
                            handleRenameRootShelfOnSubmit(summary.root)
                          }
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
                          className="rounded-sm"
                          onClick={async () => {
                            await shelfManager.expandRootShelf(edge.node);
                          }}
                        >
                          {summary.root.name}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </ContextMenuTrigger>
                  )}
                  {!shelfManager.isNewRootShelfName() && summary.hasChanged && (
                    <SidebarMenuAction className="hover:bg-primary/60 p-0.5">
                      <FolderDotIcon className="max-w-3.5 max-h-3.5" />
                    </SidebarMenuAction>
                  )}
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={async () =>
                        shelfManager.createSubShelf(
                          summary.root.id,
                          null,
                          "undefined"
                        )
                      }
                    >
                      Create an new shelf
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => {
                        shelfManager.startRenamingRootShelf(summary.root);
                      }}
                    >
                      Rename
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => {
                        shelfManager.deleteRootShelf(summary.root);
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
                      Object.keys(summary.root.children).length > 0 && (
                        <Suspense fallback={<SubShelfMenuItemSkeleton />}>
                          <SubShelfMenu summary={summary} root={summary.root} />
                        </Suspense>
                      )
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </Suspense>
        );
      })}
    </SidebarMenu>
  );
};

export default RootShelfMenu;
