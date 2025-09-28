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
import { useShelf } from "@/hooks";
import { MaxShelfDepth } from "@shared/constants";
import {
  RootShelfNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";
import { Suspense } from "react";

interface SubShelfMenuItemProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
  parent: SubShelfNode | null;
  current: SubShelfNode;
  depth: number;
}

const SubShelfMenuItem = ({
  summary,
  root,
  parent,
  current,
  depth,
}: SubShelfMenuItemProps) => {
  const shelfManager = useShelf();

  if (depth > MaxShelfDepth) {
    <SidebarMenuSubItem>
      <SidebarMenuButton className="rounded-sm text-muted">
        ... (Too deep)
      </SidebarMenuButton>
    </SidebarMenuSubItem>;
  }

  return (
    <Collapsible>
      <SidebarMenuItem>
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
              Create an new shelf
            </ContextMenuItem>
            <ContextMenuItem onClick={() => {}}>
              Create an new material
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                shelfManager.deleteSubShelf(parent, current);
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
                  ([subShelfId, subShelfNode]) =>
                    subShelfNode && (
                      <SubShelfMenuItem
                        key={subShelfId}
                        summary={summary}
                        root={root}
                        parent={current}
                        current={subShelfNode}
                        depth={depth + 1}
                      />
                    )
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
