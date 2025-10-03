import { useShelfMaterial } from "@/hooks";
import {
  MaterialNode,
  RootShelfNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { SidebarMenuButton } from "../ui/sidebar";

interface MaterialMenuItemProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
  parent: SubShelfNode;
  current: MaterialNode;
}

const MaterialMenuItem = ({
  summary,
  root,
  parent,
  current,
}: MaterialMenuItemProps) => {
  const shelfMaterialManager = useShelfMaterial();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SidebarMenuButton
          className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden 
            ${current.isOpen ? "bg-primary/60" : "bg-transparent"}`}
          onClick={() => {
            // open the file and place it to the background
            shelfMaterialManager.toggleMaterial(current);
          }}
        >
          <span>{current.name}</span>
        </SidebarMenuButton>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            shelfMaterialManager.startRenamingMaterialNode(current)
          }
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem
          onClick={async () =>
            await shelfMaterialManager.deleteMaterial(parent, current)
          }
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MaterialMenuItem;
