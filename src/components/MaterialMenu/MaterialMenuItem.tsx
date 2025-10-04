import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useLoading, useShelfMaterial } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import {
  MaterialNode,
  RootShelfNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";

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
  const loadingManager = useLoading();
  const router = useAppRouter();
  const shelfMaterialManager = useShelfMaterial();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SidebarMenuButton
          className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden 
            ${current.isOpen ? "bg-primary/60" : "bg-transparent"}`}
          onClick={() => {
            loadingManager.setIsLoading(true);
            const nextPath = WebURLPathDictionary.root.materialEditor.byId(
              current.id
            );
            if (router.isSamePath(router.currentPath, nextPath)) {
              loadingManager.setIsLoading(false);
            } else router.push(nextPath);
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
