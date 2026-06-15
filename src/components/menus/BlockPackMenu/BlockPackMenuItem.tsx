import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { BlockPackNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useAppRouter, useLanguage, useShelfItem } from "@/hooks";

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
        <ContextMenuLabel>View</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem onClick={handleBlockPackOnClick}>
            Open
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuLabel>Edit</ContextMenuLabel>
        <ContextMenuGroup>
          <ContextMenuItem
            onClick={() => shelfItemManager.startRenamingItemNode(current)}
          >
            Rename
          </ContextMenuItem>
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={async () => {
              await shelfItemManager.deleteBlockPack(parent, current);
              if (current.id === (router.params.blockPackId as string)) {
                router.push(WebURLPathDictionary.root.materialViewer._);
              }
            }}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default BlockPackMenuItem;
