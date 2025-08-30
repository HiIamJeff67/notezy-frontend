import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useLoading, useShelf } from "@/hooks";
import { useEffect } from "react";

const ShelfMenu = () => {
  const loadingManager = useLoading();
  const shelfManager = useShelf();

  useEffect(() => {
    const initSearchCompressedShelves = async () => {
      await shelfManager.searchCompressedShelves();
    };
    initSearchCompressedShelves();

    loadingManager.setIsLoading(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      shelfManager.expandShelvesForward(50);
    }, 1000);
  }, [shelfManager.compressedShelves]);

  useEffect(() => {
    if (shelfManager.isExpanding === false) {
      console.log("expanded shelves: ", shelfManager.expandedShelves);
    }
  }, [shelfManager.isExpanding]);

  return (
    <SidebarMenuSubItem>
      <SidebarMenu>
        {shelfManager.compressedShelves.map((val, index) => (
          <Collapsible key={index}>
            <SidebarMenuItem>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="rounded-sm"
                      onContextMenu={() => console.log("test")}
                    >
                      {val.node.name}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Add</ContextMenuItem>
                  <ContextMenuItem>Delete</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {/* recursive starts here */}
                  <SidebarMenuSubItem> </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarMenuSubItem>
  );
};

export default ShelfMenu;
