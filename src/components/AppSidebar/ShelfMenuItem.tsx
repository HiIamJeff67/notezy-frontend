import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useShelf } from "@/hooks";
import { MaxShelfDepth } from "@shared/constants";
import { ShelfSummary } from "@shared/lib/shelfManipulator";
import { ShelfNode } from "@shared/lib/shelfNode";
import { Suspense } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import ShelfMenuSkeleton from "./SidebarMenuSkeleton";

interface ShelfMenuItemProps {
  summary: ShelfSummary;
  current: ShelfNode;
  depth: number;
}

const ShelfMenuItem = ({ summary, current, depth }: ShelfMenuItemProps) => {
  const shelfManager = useShelf();

  if (depth > MaxShelfDepth) {
    <SidebarMenuSubItem>
      <SidebarMenuButton className="rounded-sm text-muted">
        ... (Too deep)
      </SidebarMenuButton>
    </SidebarMenuSubItem>;
  }

  return (
    <SidebarMenu>
      {Object.entries(current.Children).map(
        ([shelfId, child], index) =>
          child && (
            <Collapsible key={child.Id || index}>
              <SidebarMenuItem>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className="rounded-sm"
                        onContextMenu={() => {}}
                      >
                        {child.Name}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() =>
                        shelfManager.createSubShelf(
                          summary.root.Id,
                          child,
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
                          key={shelfId}
                          summary={summary}
                          current={child}
                          depth={depth + 1}
                        />
                      </SidebarMenuSubItem>
                    </Suspense>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
      )}

      {Object.entries(current.MaterialIdToName).map(
        ([materialId, materialName], index) =>
          materialName !== "" && (
            <SidebarMenuItem key={index} id={materialId}>
              <SidebarMenuButton className="rounded-sm" onClick={() => {}}>
                {materialName}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
      )}
    </SidebarMenu>
  );
};

export default ShelfMenuItem;
