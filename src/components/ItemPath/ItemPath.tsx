"use client";

import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import ItemPathItem from "@/components/ItemPath/ItemPathItem";
import WrapPlaceholder from "@/components/Placeholders/WrapPlaceholder";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ItemType } from "@shared/types/itemNodes.type";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import { useCallback } from "react";

interface ItemPathProps {
  parentSubShelfId: UUID;
  itemId: UUID;
  itemType: ItemType;
  path: UUID[];
  summary?: ShelfTreeSummary;
}

const ItemPath = ({
  parentSubShelfId,
  itemId,
  itemType,
  path,
  summary,
}: ItemPathProps) => {
  if (!summary) return <></>;

  const tracePathInSummary = useCallback((): SubShelfNode[] => {
    if (path.length === 0) {
      const parentSubShelfNode = summary.root.children[parentSubShelfId];
      return parentSubShelfNode ? [parentSubShelfNode] : [];
    }
    const subShelfNodes: SubShelfNode[] = [];

    let cur = summary.root.children[path[0]];
    if (!cur) return [];
    subShelfNodes.push(cur);
    for (let i = 1; i < path.length; i++) {
      const next = cur.children[path[i]];
      if (!next) return [];
      subShelfNodes.push(next);
      cur = next;
    }

    const parentSubShelfNode = cur.children[parentSubShelfId];
    if (!parentSubShelfNode) return [];
    subShelfNodes.push(parentSubShelfNode);
    return subShelfNodes;
  }, [path, parentSubShelfId, summary]);

  const subShelfNodes = tracePathInSummary();

  return (
    <Breadcrumb className="bg-muted/25 w-full">
      <BreadcrumbList className="px-4 py-1 w-full">
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="select-none hover:underline text-secondary-foreground/80 font-semibold">
              {summary.root.name}
            </DropdownMenuTrigger>
            {Object.entries(summary.root.children).length !== 0 && (
              <DropdownMenuContent>
                {Object.entries(summary.root.children).map(([id, child]) => {
                  return (
                    <DropdownMenuItem key={id}>
                      <ChevronRightIcon />
                      <span>{child.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </BreadcrumbItem>
        {subShelfNodes.map((subShelfNode, index) => {
          if (index === subShelfNodes.length - 1) {
            let itemName: string | undefined = undefined;

            switch (itemType) {
              case "BlockPack":
                if (subShelfNode.blockPackNodes[itemId])
                  itemName = subShelfNode.blockPackNodes[itemId].name;
                break;
              case "Material":
                if (subShelfNode.materialNodes[itemId])
                  itemName = subShelfNode.materialNodes[itemId].name;
                break;
            }

            if (itemName) {
              return (
                <WrapPlaceholder key={index}>
                  <ItemPathItem
                    key={subShelfNode.id}
                    rootShelfNode={summary.root}
                    subShelfNode={subShelfNode}
                  />
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="select-none cursor-pointer hover:underline text-secondary-foreground/80 font-semibold">
                    {itemName}
                  </BreadcrumbItem>
                </WrapPlaceholder>
              );
            }
          }

          return (
            <ItemPathItem
              key={subShelfNode.id}
              rootShelfNode={summary.root}
              subShelfNode={subShelfNode}
            />
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default ItemPath;
