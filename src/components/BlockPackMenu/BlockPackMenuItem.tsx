import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useShelfItem } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { BlockPackNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
import toast from "react-hot-toast";

interface BlockPackMenuItemProps {
  parent: SubShelfNode;
  current: BlockPackNode;
}

const BlockPackMenuItem = ({ parent, current }: BlockPackMenuItemProps) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleBlockPackOnClick = useCallback(() => {
    try {
      router.push(
        WebURLPathDictionary.root.blockPackEditor._(
          current.id,
          parent.id,
          parent.rootShelfId
        )
      );
      shelfItemManager.toggleBlockPack(current);
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
          onClick={handleBlockPackOnClick}
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
            await shelfItemManager.deleteBlockPack(parent, current);
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

export default BlockPackMenuItem;
