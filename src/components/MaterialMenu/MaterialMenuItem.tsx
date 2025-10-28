import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useShelfMaterial } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { MaterialType } from "@shared/types/enums";
import {
  MaterialNode,
  RootShelfNode,
  SubShelfNode,
} from "@shared/types/shelfMaterialNodes";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { useCallback } from "react";
import toast from "react-hot-toast";

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
  const languageManager = useLanguage();
  const shelfMaterialManager = useShelfMaterial();

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
      shelfMaterialManager.toggleMaterial(current);
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  }, [parent, current, router, shelfMaterialManager]);

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
          onClick={handleMaterialOnClick}
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
