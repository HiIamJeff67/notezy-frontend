import type { PartialBlock } from "@blocknote/core";
import { generateUUID } from "@shared/types/uuidv4.type";

export type FlattenedEditableBlock = {
  id: string;
  parentBlockId: string | null;
  type: string;
  props: unknown;
  content: unknown;
};

export type LocalBlockRowInput = {
  id: string;
  parentBlockId: string | null;
  blockGroupId: string;
  type: string;
  props: string;
  content: string;
  deletedAt?: Date | null;
  updatedAt?: Date;
  createdAt?: Date;
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

  private static parseJSON(value: string, fallback: unknown): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  public static flatten(
    root: PartialBlock | null | undefined
  ): FlattenedEditableBlock[] {
    if (!root) return [];

    const queue: Array<{ node: PartialBlock; parentBlockId: string | null }> =
      [{ node: root, parentBlockId: null }];
    const nodeIdMap = new WeakMap<object, string>();
    const visited = new Set<string>();
    const rows: FlattenedEditableBlock[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;

      const id = EditableBlockManipulator.resolveId(current.node, nodeIdMap);
      if (visited.has(id)) continue;
      visited.add(id);

      rows.push({
        id,
        parentBlockId: current.parentBlockId,
        type: current.node.type ?? EditableBlockManipulator.defaultBlockType,
        props: current.node.props ?? {},
        content: current.node.content ?? [],
      });

      const children = current.node.children ?? [];
      for (const child of children) {
        queue.push({
          node: child,
          parentBlockId: id,
        });
      }
    }

    return rows;
  }

  public static flattenToRows(
    root: PartialBlock | null | undefined,
    options: {
      blockGroupId: string;
      deletedAt?: Date | null;
      updatedAt?: Date;
      createdAt?: Date;
    }
  ): LocalBlockRowInput[] {
    return EditableBlockManipulator.flatten(root).map(block => ({
      id: block.id,
      parentBlockId: block.parentBlockId,
      blockGroupId: options.blockGroupId,
      type: block.type,
      props: JSON.stringify(block.props ?? {}),
      content: JSON.stringify(block.content ?? []),
      deletedAt: options.deletedAt,
      updatedAt: options.updatedAt,
      createdAt: options.createdAt,
    }));
  }

  public static arborize(
    blocks: FlattenedEditableBlock[],
    options?: { rootBlockId?: string }
  ): PartialBlock | null {
    if (blocks.length === 0) return null;

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
      return blockMap.get(options.rootBlockId) ?? null;
    }
    if (rootCandidates.length > 0) {
      return blockMap.get(rootCandidates[0]) ?? null;
    }

    return blockMap.get(blocks[0].id) ?? null;
  }

  public static arborizeRows(
    rows: Array<{
      id: string;
      parentBlockId: string | null;
      type: string;
      props: string;
      content: string;
    }>,
    options?: { rootBlockId?: string }
  ): PartialBlock | null {
    const flattened: FlattenedEditableBlock[] = rows.map(row => ({
      id: row.id,
      parentBlockId: row.parentBlockId,
      type: row.type,
      props: EditableBlockManipulator.parseJSON(row.props, {}),
      content: EditableBlockManipulator.parseJSON(row.content, []),
    }));

    return EditableBlockManipulator.arborize(flattened, options);
  }
}
