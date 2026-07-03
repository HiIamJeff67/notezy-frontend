import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { BlockPackNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
import ContextMenuCopyItems from "@/components/commons/ContextMenuCopyItems/ContextMenuCopyItems";
import HoverDetailCard from "@/components/commons/HoverDetailCard/HoverDetailCard";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
      <HoverCard openDelay={250} closeDelay={100}>
        <HoverCardTrigger asChild>
          <ContextMenuTrigger asChild>
            <SidebarMenuButton
              className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden ${
                shelfItemManager.isFocused(current.id)
                  ? "bg-primary/60"
                  : "bg-transparent"
              }`}
              onClick={handleBlockPackOnClick}
            >
              <span>{current.name}</span>
            </SidebarMenuButton>
          </ContextMenuTrigger>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={8}
          className="z-[90] w-72 rounded-sm p-3 text-xs"
        >
          <HoverDetailCard
            title={current.name}
            subtitle="Block Pack"
            id={current.id}
            rows={[
              { field: "Blocks", value: current.blockCount },
              {
                field: "Updated",
                value: new Date(current.updatedAt).toLocaleDateString(),
              },
            ]}
          />
        </HoverCardContent>
      </HoverCard>
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
          <ContextMenuCopyItems id={current.id} name={current.name} />
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
