import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import WrapPlaceholder from "@/components/placeholders/WrapPlaceholder";
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppRouter, useLanguage, useShelfItem } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { MaterialType } from "@shared/enums";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { useCallback } from "react";
import toast from "react-hot-toast";

interface ItemPathItemProps {
  key?: any;
  rootShelfNode: RootShelfNode;
  subShelfNode: SubShelfNode;
}

const ItemPathItem = ({ rootShelfNode, subShelfNode }: ItemPathItemProps) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleBlockPackOnClick = useCallback(
    (current: BlockPackNode, parent: SubShelfNode) => {
      try {
        shelfItemManager.toggleBlockPack(current);
        router.push(
          WebURLPathDictionary.root.blockPackEditor._(
            current.id,
            parent.id,
            parent.rootShelfId
          )
        );
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    },
    [router, shelfItemManager]
  );

  const handleMaterialOnClick = useCallback(
    (current: MaterialNode, parent: SubShelfNode) => {
      try {
        let nextPath: string | undefined = undefined;

        switch (current.type) {
          case MaterialType.Notebook:
            nextPath = WebURLPathDictionary.root.materialEditor.notebook(
              current.id,
              parent.id,
              parent.rootShelfId
            );
            break;
          case MaterialType.Textbook:
            nextPath = WebURLPathDictionary.root.materialEditor.textbook(
              current.id,
              parent.id,
              parent.rootShelfId
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
    },
    [router, shelfItemManager]
  );

  return (
    <WrapPlaceholder>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="select-none hover:underline text-secondary-foreground/80 font-semibold">
            {subShelfNode.name}
          </DropdownMenuTrigger>
          {(Object.entries(subShelfNode.children).length !== 0 ||
            Object.entries(subShelfNode.blockPackNodes).length !== 0) && (
            <DropdownMenuContent>
              {Object.entries(subShelfNode.children).map(([id, child]) => {
                return (
                  <DropdownMenuItem
                    key={id}
                    onClick={async () => {
                      if (!child.isExpanded) {
                        await shelfItemManager.expandSubShelf(
                          rootShelfNode,
                          child
                        );
                      }
                      shelfItemManager.toggleSubShelf(child);
                    }}
                  >
                    <ChevronRightIcon />
                    <span>{child.name}</span>
                  </DropdownMenuItem>
                );
              })}
              {Object.entries(subShelfNode.blockPackNodes).map(
                ([id, blockPackNode]) => {
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleBlockPackOnClick(blockPackNode, subShelfNode)
                      }
                    >
                      {blockPackNode.name}
                    </DropdownMenuItem>
                  );
                }
              )}
              {Object.entries(subShelfNode.materialNodes).map(
                ([id, materialNode]) => {
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleMaterialOnClick(materialNode, subShelfNode)
                      }
                    >
                      {materialNode.name}
                    </DropdownMenuItem>
                  );
                }
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </BreadcrumbItem>
    </WrapPlaceholder>
  );
};

export default ItemPathItem;
