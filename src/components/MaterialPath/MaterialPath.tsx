"use client";

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
import { SubShelfNode } from "@shared/types/shelfMaterialNodes";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import { useCallback } from "react";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import MaterialPathItem from "./MaterialPathItem";

interface MaterialPathProps {
  parentSubShelfId: UUID;
  materialId: UUID;
  path: UUID[];
  summary?: ShelfTreeSummary;
}

const MaterialPath = ({
  parentSubShelfId,
  materialId,
  path,
  summary,
}: MaterialPathProps) => {
  if (!summary) return <></>;

  // !Note that the path would not contain the current sub shelf and the root shelf, and the material itself
  // so we have to place them into the path, also display them as different icon and functionality
  // we still need the summary, so that we can trace the shelf tree summary by tracing the path we got here and then extract the name and detail of each shelves

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

    const parentSubShelfNode = summary.root.children[parentSubShelfId];
    if (!parentSubShelfNode) return [];
    subShelfNodes.push(parentSubShelfNode);
    return subShelfNodes;
  }, [path, parentSubShelfId, summary]);

  const subShelfNodes = tracePathInSummary();

  return (
    <Breadcrumb className="bg-muted/25 w-full">
      <BreadcrumbList className="px-4 py-1">
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
          if (
            index === subShelfNodes.length - 1 &&
            subShelfNode.materialNodes[materialId]
          ) {
            return (
              <WrapPlaceholder>
                <MaterialPathItem
                  key={subShelfNode.id}
                  rootShelfNode={summary.root}
                  subShelfNode={subShelfNode}
                />
                <BreadcrumbSeparator />
                <BreadcrumbItem className="select-none cursor-pointer hover:underline text-secondary-foreground/80 font-semibold">
                  {subShelfNode.materialNodes[materialId].name}
                </BreadcrumbItem>
              </WrapPlaceholder>
            );
          }
          return (
            <MaterialPathItem
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

export default MaterialPath;
