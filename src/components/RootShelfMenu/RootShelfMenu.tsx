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
import { useLoading, useShelf } from "@/hooks";
import { FolderDotIcon } from "lucide-react";
import { Suspense, useEffect } from "react";

const RootShelfMenu = () => {
  const loadingManager = useLoading();
  const shelfManager = useShelf();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  return (
    <SidebarMenu>
      {shelfManager.rootShelfEdges.map((edge, index) => {
        const summary = shelfManager.expandedShelves.get(edge.node.id);

        return summary === undefined ? (
          <RootShelfMenuItemSkeleton key={index} />
        ) : (
          <Suspense fallback={<RootShelfMenuItemSkeleton />} key={index}>
            <Collapsible>
              <SidebarMenuItem>
                <ContextMenu>
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
                  {summary.hasChanged && (
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
