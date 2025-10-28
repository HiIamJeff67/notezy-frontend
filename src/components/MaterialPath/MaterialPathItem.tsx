import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import WrapPlaceholder from "@/components/Placeholders/WrapPlaceholder";
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
import { useAppRouter, useLanguage, useShelfMaterial } from "@/hooks";
import { WebURLPathDictionary } from "@shared/constants";
import { MaterialType } from "@shared/types/enums";
import {
  MaterialNode,
  RootShelfNode,
  SubShelfNode,
} from "@shared/types/shelfMaterialNodes";
import { useCallback } from "react";
import toast from "react-hot-toast";

interface MaterialPathItemProps {
  key?: any;
  rootShelfNode: RootShelfNode;
  subShelfNode: SubShelfNode;
}

const MaterialPathItem = ({
  key,
  rootShelfNode,
  subShelfNode,
}: MaterialPathItemProps) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const shelfMaterialManager = useShelfMaterial();

  const handleMaterialOnClick = useCallback(
    (current: MaterialNode, parent: SubShelfNode) => {
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
    },
    [router, shelfMaterialManager]
  );

  return (
    <WrapPlaceholder key={key}>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="select-none hover:underline text-secondary-foreground/80 font-semibold">
            {subShelfNode.name}
          </DropdownMenuTrigger>
          {(Object.entries(subShelfNode.children).length !== 0 ||
            Object.entries(subShelfNode.materialNodes).length !== 0) && (
            <DropdownMenuContent>
              {Object.entries(subShelfNode.children).map(([id, child]) => {
                return (
                  <DropdownMenuItem
                    key={id}
                    // onClick={async () => {
                    //   if (!child.isExpanded) {
                    //     await shelfMaterialManager.expandSubShelf(
                    //       rootShelfNode,
                    //       child
                    //     );
                    //   }
                    //   shelfMaterialManager.toggleSubShelf(child);
                    // }}
                  >
                    <ChevronRightIcon />
                    <span>{child.name}</span>
                  </DropdownMenuItem>
                );
              })}
              {Object.entries(subShelfNode.materialNodes).map(
                ([id, material]) => {
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleMaterialOnClick(material, subShelfNode)
                      }
                    >
                      {material.name}
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

export default MaterialPathItem;
