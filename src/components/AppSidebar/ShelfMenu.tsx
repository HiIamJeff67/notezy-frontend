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
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLoading, useShelf } from "@/hooks";
import { FolderSyncIcon } from "lucide-react";
import { Suspense, useEffect } from "react";
import ShelfMenuItem from "./ShelfMenuItem";
import ShelfMenuSkeleton from "./SidebarMenuSkeleton";

const ShelfMenu = () => {
  const loadingManager = useLoading();
  const shelfManager = useShelf();

  useEffect(() => {
    loadingManager.setIsLoading(false);
  }, []);

  return (
    <SidebarMenu>
      {shelfManager.compressedShelves.map((val, index) => {
        // console.log("id: ", val.node.id);
        const summary = shelfManager.expandedShelves.get(val.node.id);
        // console.log("summary: ", summary);

        return (
          summary && (
            <Collapsible key={index}>
              <SidebarMenuItem>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className="rounded-sm"
                        onContextMenu={() => console.log("test")}
                      >
                        {summary.root.Name}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </ContextMenuTrigger>
                  {!summary.hasChanged && (
                    <SidebarMenuAction className="hover:bg-primary/60 p-0.5">
                      <FolderSyncIcon className="max-w-3.5 max-h-3.5" />
                    </SidebarMenuAction>
                  )}
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() =>
                        shelfManager.createSubShelf(
                          summary.root.Id,
                          summary.root,
                          "undefined"
                        )
                      }
                    >
                      Create an new shelf
                    </ContextMenuItem>
                    <ContextMenuItem>Create an new material</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <Suspense fallback={<ShelfMenuSkeleton />}>
                      <SidebarMenuSubItem>
                        <ShelfMenuItem
                          summary={summary}
                          current={summary.root}
                          depth={0}
                        />
                      </SidebarMenuSubItem>
                    </Suspense>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        );
      })}
    </SidebarMenu>
  );
};

export default ShelfMenu;
