import { WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import { MaterialNode } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
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
      <HoverCard openDelay={250} closeDelay={100}>
        <HoverCardTrigger asChild>
          <ContextMenuTrigger asChild>
            <SidebarMenuButton
              className={`w-full rounded-sm whitespace-nowrap text-ellipsis overflow-hidden ${
                shelfItemManager.isFocused(current.id)
                  ? "bg-primary/60"
                  : "bg-transparent"
              }`}
              onClick={handleMaterialOnClick}
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
            subtitle="Material"
            id={current.id}
            rows={[
              { field: "Content Type", value: current.contentType },
              { field: "Size", value: current.size },
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
          <ContextMenuItem onClick={handleMaterialOnClick}>
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
              await shelfItemManager.deleteMaterial(parent, current);
              if (current.id === (router.params.materialId as string)) {
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

export default MaterialMenuItem;
