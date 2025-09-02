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
  parent: ShelfNode;
  depth: number;
}

const ShelfMenuItem = ({ summary, parent, depth }: ShelfMenuItemProps) => {
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
      {Object.entries(parent.Children).map(
        ([shelfId, current], index) =>
          current && (
            <Collapsible key={current.Id || index}>
              <SidebarMenuItem>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className="rounded-sm"
                        onContextMenu={() => {}}
                      >
                        {current.Name}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() =>
                        shelfManager.createChildShelf(
                          summary.root.Id,
                          current,
                          "undefined"
                        )
                      }
                    >
                      Create an new shelf
                    </ContextMenuItem>
                    <ContextMenuItem>Create an new material</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      onClick={() => {
                        shelfManager.deleteRootShelf(current.Id);
                      }}
                    >
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <Suspense fallback={<ShelfMenuSkeleton />}>
                      <SidebarMenuSubItem>
                        <ShelfMenuItem
                          key={shelfId}
                          summary={summary}
                          parent={current}
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

      {Object.entries(parent.MaterialIdToName).map(
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
