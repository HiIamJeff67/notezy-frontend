import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useShelfItem } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { MaterialType } from "@shared/types/enums";
import { MaterialNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
import toast from "react-hot-toast";

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
      let nextPath: string | undefined = undefined;

      switch (current.type) {
        case MaterialType.Notebook:
          nextPath = WebURLPathDictionary.root.materialEditor.notebook(
            current.id,
            parent.id
          );
          break;
        case MaterialType.Textbook:
          nextPath = WebURLPathDictionary.root.materialEditor.textbook(
            current.id,
            parent.id
          );
          break;
        default:
          throw new Error(`Unsupported type`);
      }

      router.push(nextPath);
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
          onClick={async () => {
            await shelfItemManager.deleteMaterial(parent, current);
            if (current.id === (router.params.materialId as string)) {
              router.push(WebURLPathDictionary.root.materialEditor._);
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
