import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { MaterialNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useShelfItem } from "@/hooks";

interface MaterialMenuItemProps {
  parent: SubShelfNode;
  current: MaterialNode;
}

const MaterialMenuItem = ({ parent, current }: MaterialMenuItemProps) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleMaterialOnClick = useCallback(() => {
    try {
      router.push(
        WebURLPathDictionary.root.materialViewer.byId(
          current.id,
          parent.id,
          parent.rootShelfId
        )
      );
      shelfItemManager.toggleMaterial(current);
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  }, [parent, current, router, shelfItemManager]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <SidebarMenuButton
          className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden 
            ${
              shelfItemManager.isFocused(current.id)
                ? "bg-primary/60"
                : "bg-transparent"
            }`}
          onClick={handleMaterialOnClick}
        >
          <span>{current.name}</span>
        </SidebarMenuButton>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => shelfItemManager.startRenamingItemNode(current)}
        >
          Rename
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            await shelfItemManager.deleteMaterial(parent, current);
            if (current.id === (router.params.materialId as string)) {
              router.push(WebURLPathDictionary.root.materialViewer._);
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
