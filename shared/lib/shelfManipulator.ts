import { decode, encode } from "@msgpack/msgpack";
import {
  DefaultShelfManipulatorIterations,
  MaxShelfManipulatorIterations,
} from "../constants";
import { isValidUUID, UUID } from "../types/uuid_v4.type";
import { ShelfNode } from "./shelfNode";

// This shelf summary structure maybe different from the backend,
// Since we may require more information for the client user
export interface ShelfSummary {
  root: ShelfNode;
  encodedStructureByteSize: number;
  hasChanged: boolean;
  totalShelfNodes: number;
  totalMaterials: number;
  maxWidth: number;
  maxDepth: number;
  uniqueMaterialIds: UUID[];
}

export class ShelfManipulator {
  private static maxTraverseCount: number = DefaultShelfManipulatorIterations;
  private static maxShelfWidth: number = DefaultShelfManipulatorIterations;
  private static maxShelfDepth: number = 100; // note that the maximum width is bounded by the msgpack encoding algorithm

  constructor(maxTraverseCount: number = DefaultShelfManipulatorIterations) {
    ShelfManipulator.maxTraverseCount = maxTraverseCount;
    ShelfManipulator.maxShelfWidth = maxTraverseCount; // same as the iteration
  }

  private static estimateSingleNodeSize(node: ShelfNode): number {
    // 36 bytes for UUID + 20 bytes for the approximate structure cost
    // + approximate estimate UTF-8 to be 2 bytes/char
    let size = 56 + node.Name.length * 2;

    const childrenCount = Object.keys(node.Children).length;
    const materialCount = Object.keys(node.MaterialIds).length;
    size += (childrenCount + materialCount) * 36; // for each key of UUID data type
    size += (childrenCount + materialCount) * 1; // null/reference overhead and boolean value

    return size;
  }

  public static getMaxTraverseCount(): number {
    return ShelfManipulator.maxTraverseCount;
  }

  public static setMaxTraverseCount(value: number): void {
    ShelfManipulator.maxTraverseCount = Math.min(
      MaxShelfManipulatorIterations,
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
        if (traverseCount > ShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.Id)) {
          throw new Error(`Cycle detected at node: ${current.Id}`);
        }
        visited.add(current.Id);

        if (current.Id == desiredChild.Id) {
          return true;
        }

        for (const child of Object.values(current.Children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return false;
  }

  public static isChildrenSimple(root: ShelfNode): {
    isSimple: boolean;
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
        if (traverseCount > ShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.Id)) {
          return { isSimple: false, cycleNode: current };
        }
        visited.add(current.Id);

        for (const child of Object.values(current.Children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return {
      isSimple: true,
      cycleNode: null,
    };
  }

  public static isChildrenSimpleWithUUIDConversion(root: ShelfNode): {
    isSimple: boolean;
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
        if (traverseCount > ShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        // convert the id of Uint8Array to the actual UUID form
        if (!isValidUUID(current.Id)) {
          current.Id = Buffer.from(current.Id).toString("hex") as UUID;
        }

        if (visited.has(current.Id)) {
          return { isSimple: false, cycleNode: current };
        }
        visited.add(current.Id);

        for (const child of Object.values(current.Children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return {
      isSimple: true,
      cycleNode: null,
    };
  }

  public static analysisAndGenerateSummary(root: ShelfNode): ShelfSummary {
    let totalShelfNodes: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0,
      encodedStructureByteSize: number = 0;

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
        if (totalShelfNodes > ShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations (${ShelfManipulator.maxTraverseCount}) exceeded`
          );
        }

        const current = queue.shift()!;
        totalShelfNodes++;

        if (visited.has(current.Id)) {
          throw new Error(`Cycle detected at node: ${current.Id}`);
        }
        visited.add(current.Id);

        encodedStructureByteSize += this.estimateSingleNodeSize(current);

        for (const materialId of Object.keys(current.MaterialIds)) {
          uniqueMaterialIdsSet.add(materialId as UUID);
        }

        for (const child of Object.values(current.Children)) {
          if (child) queue.push(child);
        }
      }
    }

    return {
      root: root,
      encodedStructureByteSize: encodedStructureByteSize,
      hasChanged: false,
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
    const { isSimple } = this.isChildrenSimple(node);
    if (!isSimple) {
      throw new Error("Failed to encode, cycle detected");
    }
    return encode(node);
  }

  public static decode(data: Uint8Array): ShelfNode {
    return decode(data) as ShelfNode;
  }

  public static safeDecode(data: Uint8Array): ShelfNode {
    const root = decode(data) as ShelfNode;
    const { isSimple } = this.isChildrenSimpleWithUUIDConversion(root);
    if (!isSimple) {
      throw new Error("Failed to decode, cycle detected");
    }
    return root;
  }

  /*
   * This method will encode the shelf node
   * from shelf node data structure to base64 string
   *
   * Note that it is necessary to encode or decode it
   * through base64, since we get or post it through API,
   * and the API will first serialize it to the json form
   * which is encoding it to base64 string
   */
  public static encodeToBase64(node: ShelfNode): string {
    const encoded = this.safeEncode(node);
    return Buffer.from(encoded).toString("base64");
  }

  /*
   * This method will decode the shelf node
   * from base64 string to shelf node data structure
   *
   * Note that it is necessary to encode or decode it
   * through base64, since we get or post it through API,
   * and the API will first serialize it to the json form
   * which is encoding it to base64 string
   */
  public static decodeFromBase64(base64: string): ShelfNode {
    const buffer = Buffer.from(base64, "base64");
    return this.safeDecode(new Uint8Array(buffer));
  }

  public static directlyInsertShelfNode(
    destination: ShelfNode,
    target: ShelfNode
  ) {
    if (destination == target) return;

    destination.Children[target.Id] = target;
  }

  public static insertShelfNode(destination: ShelfNode, target: ShelfNode) {
    if (destination == target) return;

    if (this.isChild(target, destination)) {
      throw new Error(`Insert parent into one of its child`);
    }

    destination.Children[target.Id] = target;
  }
}
