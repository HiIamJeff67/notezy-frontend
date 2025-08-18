import { UUID } from "@/shared/types/uuid_v4.type";
import { decode, encode } from "@msgpack/msgpack";

export interface ShelfNode {
  id: UUID;
  name: string;
  children: Record<UUID, ShelfNode | null>;
  materialIds: Record<UUID, boolean>;
}

export class ShelfManager {
  private static _maxIterations: number = 1e5;
  private static maxIterations: number = 1e5;
  private static maxShelfWidth: number = 1e5;
  private static maxShelfDepth: number = 100; // note that the maximum width is bounded by the msgpack encoding algorithm

  constructor(maxIterations: number = 1e5) {
    ShelfManager.maxIterations = maxIterations;
  }

  public static getMaxIterations(): number {
    return ShelfManager.maxIterations;
  }

  public static setMaxIterations(value: number): void {
    ShelfManager.maxIterations = Math.min(ShelfManager._maxIterations, value);
  }

  public static isChildrenCircular(root: ShelfNode): void {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: ShelfNode[] = [root];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > ShelfManager.maxIterations) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfManager.maxIterations}`
          );
        }
        if (maxDepth > ShelfManager.maxShelfDepth) {
          throw new Error(
            `Maximum depth of ${maxDepth} exceeded the limit of ${ShelfManager.maxShelfDepth}`
          );
        }
        if (maxWidth > ShelfManager.maxShelfWidth) {
          throw new Error(
            `Maximum width of ${maxWidth} exceeded the limit of ${ShelfManager.maxShelfWidth}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        for (const child of Object.values(current.children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }
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

      while (levelSize--) {
        if (totalShelfNodes > ShelfManager.maxIterations) {
          throw new Error(
            `Maximum iterations (${ShelfManager.maxIterations}) exceeded`
          );
        }
        if (maxDepth > ShelfManager.maxShelfDepth) {
          throw new Error(
            `Maximum depth (${ShelfManager.maxShelfDepth}) exceeded`
          );
        }
        if (maxWidth > ShelfManager.maxShelfWidth) {
          throw new Error(
            `Maximum width (${ShelfManager.maxShelfWidth}) exceeded`
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

  public static encodeToBase64(node: ShelfNode): string {
    const encoded = this.encode(node);
    return Buffer.from(encoded).toString("base64");
  }

  public static decodeFromBase64(base64: string): ShelfNode {
    const buffer = Buffer.from(base64, "base64");
    return this.decode(new Uint8Array(buffer));
  }
}
