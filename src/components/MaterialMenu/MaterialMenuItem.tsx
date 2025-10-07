import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useShelfMaterial } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import {
  MaterialNode,
  RootShelfNode,
  SubShelfNode,
} from "@shared/types/shelfMaterialNodes";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";

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
  const router = useAppRouter();
  const shelfMaterialManager = useShelfMaterial();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SidebarMenuButton
          className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden 
            ${
              shelfMaterialManager.isFocused(current.id)
                ? "bg-primary/60"
                : "bg-transparent"
            }`}
          onClick={() => {
            const nextPath = WebURLPathDictionary.root.materialEditor.notebook(
              current.id,
              parent.id
            );
            router.push(nextPath);
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
          onClick={async () => {
            await shelfMaterialManager.deleteMaterial(parent, current);
            if (current.id === (router.params.materialId as string)) {
              router.push(WebURLPathDictionary.root.materialEditor.notFound);
            }
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MaterialMenuItem;
