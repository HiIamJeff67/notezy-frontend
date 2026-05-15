import type { PartialBlock } from "@blocknote/core";
import { generateUUID } from "@shared/types/uuidv4.type";
import { JSONType } from "zod";

export type FlattenedEditableBlock = {
  id: string;
  parentBlockId: string | null;
  type: string;
  props: JSONType;
  content: JSONType[];
};

export class EditableBlockManipulator {
  private static defaultBlockType = "paragraph";

  private static resolveId(
    node: PartialBlock,
    nodeIdMap: WeakMap<object, string>
  ): string {
    const existing = nodeIdMap.get(node as object);
    if (existing) return existing;

    const id =
      typeof node.id === "string" && node.id.length > 0
        ? node.id
        : generateUUID();
    nodeIdMap.set(node as object, id);
    return id;
  }

  public static flatten(
    root: PartialBlock | null | undefined
  ): FlattenedEditableBlock[] {
    if (!root) return [];

    const queue: Array<{ node: PartialBlock; parentBlockId: string | null }> = [
      { node: root, parentBlockId: null },
    ];
    const nodeIdMap = new WeakMap<object, string>();
    const visited = new Set<string>();
    const flattenedBlocks: FlattenedEditableBlock[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;

      const id = EditableBlockManipulator.resolveId(current.node, nodeIdMap);
      if (visited.has(id)) continue;
      visited.add(id);

      flattenedBlocks.push({
        id,
        parentBlockId: current.parentBlockId,
        type: current.node.type ?? EditableBlockManipulator.defaultBlockType,
        props: (current.node.props ?? {}) as JSONType,
        content: (current.node.content ?? []) as JSONType[],
      });

      const children = current.node.children ?? [];
      for (const child of children) {
        queue.push({
          node: child,
          parentBlockId: id,
        });
      }
    }

    return flattenedBlocks;
  }

  public static arborize(
    blocks: FlattenedEditableBlock[],
    options?: { rootBlockId?: string }
  ): PartialBlock {
    if (blocks.length === 0) return {};

    const blockMap = new Map<string, PartialBlock>();
    const rootCandidates: string[] = [];

    for (const block of blocks) {
      blockMap.set(block.id, {
        id: block.id,
        type: block.type as any,
        props: block.props as any,
        content: block.content as any,
        children: [],
      });
      if (block.parentBlockId === null) {
        rootCandidates.push(block.id);
      }
    }

    for (const block of blocks) {
      if (!block.parentBlockId) continue;

      const parent = blockMap.get(block.parentBlockId);
      const child = blockMap.get(block.id);
      if (!parent || !child) continue;

      const parentChildren = parent.children ?? [];
      parentChildren.push(child);
      parent.children = parentChildren;
    }

    if (options?.rootBlockId) {
      return blockMap.get(options.rootBlockId) ?? {};
    }
    if (rootCandidates.length > 0) {
      return blockMap.get(rootCandidates[0]) ?? {};
    }

    return blockMap.get(blocks[0].id) ?? {};
  }

  public static arborizeRows(
    flatBlocks: Array<{
      id: string;
      parentBlockId: string | null;
      type: string;
      props: JSONType;
      content: JSONType[];
    }>,
    options?: { rootBlockId?: string }
  ): PartialBlock {
    const flattened: FlattenedEditableBlock[] = flatBlocks.map(flatBlock => ({
      id: flatBlock.id,
      parentBlockId: flatBlock.parentBlockId,
      type: flatBlock.type,
      props: flatBlock.props,
      content: flatBlock.content,
    }));

    return EditableBlockManipulator.arborize(flattened, options);
  }
}
