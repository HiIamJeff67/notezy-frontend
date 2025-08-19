import { UUID } from "@/shared/types/uuid_v4.type";
import { decode, encode } from "@msgpack/msgpack";

export interface ShelfNode {
  id: UUID;
  name: string;
  children: Record<UUID, ShelfNode | null>;
  materialIds: Record<UUID, boolean>;
}

export class ShelfManipulator {
  private static _maxIterations: number = 1e5;
  private static maxIterations: number = 1e5;
  private static maxShelfWidth: number = 1e5;
  private static maxShelfDepth: number = 100; // note that the maximum width is bounded by the msgpack encoding algorithm

  constructor(maxIterations: number = 1e5) {
    ShelfManipulator.maxIterations = maxIterations;
  }

  public static getMaxIterations(): number {
    return ShelfManipulator.maxIterations;
  }

  public static setMaxIterations(value: number): void {
    ShelfManipulator.maxIterations = Math.min(
      ShelfManipulator._maxIterations,
      value
    );
  }

  // Check if `desiredChild` is a child of `desiredParent`
  public static isChild(
    desiredParent: ShelfNode,
    desiredChild: ShelfNode
  ): boolean {
    if (desiredParent == desiredChild) return false;

    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: ShelfNode[] = [desiredParent];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      if (maxDepth > ShelfManipulator.maxShelfDepth) {
        throw new Error(
          `Maximum depth of ${maxDepth} exceeded the limit of ${ShelfManipulator.maxShelfDepth}`
        );
      }
      if (maxWidth > ShelfManipulator.maxShelfWidth) {
        throw new Error(
          `Maximum width of ${maxWidth} exceeded the limit of ${ShelfManipulator.maxShelfWidth}`
        );
      }

      while (levelSize--) {
        if (traverseCount > ShelfManipulator.maxIterations) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfManipulator.maxIterations}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        if (current.id == desiredChild.id) {
          return true;
        }

        for (const child of Object.values(current.children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return false;
  }

  public static isChildrenCircular(root: ShelfNode): {
    hasCycle: boolean;
    cycleNode: ShelfNode | null;
  } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: ShelfNode[] = [root];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      if (maxDepth > ShelfManipulator.maxShelfDepth) {
        throw new Error(
          `Maximum depth of ${maxDepth} exceeded the limit of ${ShelfManipulator.maxShelfDepth}`
        );
      }
      if (maxWidth > ShelfManipulator.maxShelfWidth) {
        throw new Error(
          `Maximum width of ${maxWidth} exceeded the limit of ${ShelfManipulator.maxShelfWidth}`
        );
      }

      while (levelSize--) {
        if (traverseCount > ShelfManipulator.maxIterations) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfManipulator.maxIterations}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          return { hasCycle: true, cycleNode: current };
        }
        visited.add(current.id);

        for (const child of Object.values(current.children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return {
      hasCycle: false,
      cycleNode: null,
    };
  }

  public static analysisAndGenerateSummary(root: ShelfNode): {
    totalShelfNodes: number;
    totalMaterials: number;
    maxWidth: number;
    maxDepth: number;
    uniqueMaterialIds: UUID[];
  } {
    let totalShelfNodes: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const queue: ShelfNode[] = [root];
    const visited: Set<UUID> = new Set<UUID>();
    const uniqueMaterialIdsSet: Set<UUID> = new Set<UUID>();

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      if (maxDepth > ShelfManipulator.maxShelfDepth) {
        throw new Error(
          `Maximum depth (${ShelfManipulator.maxShelfDepth}) exceeded`
        );
      }
      if (maxWidth > ShelfManipulator.maxShelfWidth) {
        throw new Error(
          `Maximum width (${ShelfManipulator.maxShelfWidth}) exceeded`
        );
      }

      while (levelSize--) {
        if (totalShelfNodes > ShelfManipulator.maxIterations) {
          throw new Error(
            `Maximum iterations (${ShelfManipulator.maxIterations}) exceeded`
          );
        }

        const current = queue.shift()!;
        totalShelfNodes++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        for (const materialId of Object.keys(current.materialIds)) {
          uniqueMaterialIdsSet.add(materialId as UUID);
        }

        for (const child of Object.values(current.children)) {
          if (child) queue.push(child);
        }
      }
    }

    return {
      totalShelfNodes: totalShelfNodes,
      totalMaterials: uniqueMaterialIdsSet.size,
      maxWidth: maxWidth,
      maxDepth: maxDepth,
      uniqueMaterialIds: Array.from(uniqueMaterialIdsSet),
    };
  }

  public static encode(node: ShelfNode): Uint8Array {
    // Make sure to do the circular check first by using
    // either isChildrenCircular or analysisAndGenerateSummary()
    return encode(node);
  }

  public static safeEncode(node: ShelfNode): Uint8Array {
    this.isChildrenCircular(node);
    return encode(node);
  }

  public static decode(data: Uint8Array): ShelfNode {
    return decode(data) as ShelfNode;
  }

  // for performance testing
  public static encodeToBase64(node: ShelfNode): string {
    const encoded = this.safeEncode(node);
    return Buffer.from(encoded).toString("base64");
  }

  // for performance testing
  public static decodeFromBase64(base64: string): ShelfNode {
    const buffer = Buffer.from(base64, "base64");
    return this.decode(new Uint8Array(buffer));
  }

  public static directlyInsertShelfNode(
    destination: ShelfNode,
    target: ShelfNode
  ) {
    if (destination == target) return;

    destination.children[target.id] = target;
  }

  public static insertShelfNode(destination: ShelfNode, target: ShelfNode) {
    if (destination == target) return;

    if (this.isChild(target, destination)) {
      throw new Error(`Insert parent into one of its child`);
    }

    destination.children[target.id] = target;
  }
}
