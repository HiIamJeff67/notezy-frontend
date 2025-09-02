import * as msgpack from "@msgpack/msgpack";
import {
  DefaultShelfManipulatorIterations,
  MaxShelfDepth,
  MaxShelfManipulatorIterations,
  MaxShelfWidth,
} from "@shared/constants";
import { ShelfNode } from "@shared/lib/shelfNode";
import { isValidUUID, uint8ArrayToUUID } from "@shared/types/uuid_v4.type";
import { UUID } from "crypto";

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
  private static maxShelfWidth: number = MaxShelfWidth;
  private static maxShelfDepth: number = MaxShelfDepth; // note that the maximum width is bounded by the msgpack encoding algorithm

  constructor(maxTraverseCount: number = DefaultShelfManipulatorIterations) {
    ShelfManipulator.maxTraverseCount = Math.min(
      MaxShelfManipulatorIterations,
      maxTraverseCount
    );
    ShelfManipulator.maxShelfWidth = Math.min(MaxShelfWidth, maxTraverseCount);
    ShelfManipulator.maxShelfWidth = Math.min(MaxShelfDepth, maxTraverseCount);
  }

  private static estimateSingleNodeSize(
    node: ShelfNode,
    materialNameCharacterCount: number
  ): number {
    // 36 bytes for UUID + 20 bytes for the approximate structure cost
    // + approximate estimate UTF-8 to be 2 bytes/char
    let size = 56 + node.Name.length * 2;

    const childrenCount = Object.keys(node.Children).length;
    const materialCount = Object.keys(node.MaterialIdToName).length;
    size += (childrenCount + materialCount) * 36; // for each key of UUID data type
    size += childrenCount + materialNameCharacterCount * 2; // null/reference overhead and string value with 10 characters

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

  /* ============================== Algorithms ============================== */

  /* Check if `desiredChild` is a child of `desiredParent` */
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

  /* Try to get the information of the `desiredChild` from the `desiredParent`
   * if the `desiredChild` is a child of `desiredParent`,
   * then return the width of the layer of `desiredChild`, and the depth from the parent to the child as an object,
   *      and the subWidth to indicate the width of the child layer of `desiredChild`
   * else return { width: -1, subWidth: -1, depth: -1 } to indicate that the `desiredChild` is not a child of `desiredParent`.
   * Note that if it return { width: 1, subWidth: x, depth: 0 }, x is the width of the child layer of `desiredParent`,
   *      then the `desiredChild` == `desiredParent`.
   */
  public static getChildInformation(
    desiredParent: ShelfNode,
    desiredChild: ShelfNode
  ): { width: number; subWidth: number; depth: number } {
    if (desiredParent == desiredChild)
      return {
        width: 1,
        subWidth: Object.entries(desiredParent.Children).length,
        depth: 0,
      };

    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: ShelfNode[] = [desiredParent];

    while (queue.length > 0) {
      let levelSize = queue.length;
      const currentWidth = levelSize;
      let isFound = false;
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
          isFound = true;
          // don't return here, wait until the while(the current layer) done
        }

        for (const child of Object.values(current.Children)) {
          if (child) {
            queue.push(child);
          }
        }
      }

      if (isFound) {
        return { width: currentWidth, subWidth: queue.length, depth: maxDepth };
      }
    }

    return { width: -1, subWidth: -1, depth: -1 };
  }

  public static getAllMaterials(node: ShelfNode): { id: UUID; name: string }[] {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: ShelfNode[] = [node];
    const uniqueMaterials: Record<UUID, string> = {};

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
          return [];
        }
        visited.add(current.Id);

        for (const [materialId, materialName] of Object.entries(
          current.MaterialIdToName
        )) {
          uniqueMaterials[materialId as UUID] = materialName;
        }

        for (const child of Object.values(current.Children)) {
          if (child) {
            queue.push(child);
          }
        }
      }
    }

    return Object.entries(uniqueMaterials).map(([id, name]) => ({
      id: id as UUID,
      name: name,
    }));
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
          current.Id = uint8ArrayToUUID(current.Id) as UUID;
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

        const uniqueMaterialNamesSet: Set<string> = new Set<string>();
        let materialNameCharacterCount: number = 0;

        for (const [materialId, materialName] of Object.entries(
          current.MaterialIdToName
        )) {
          if (uniqueMaterialNamesSet.has(materialName)) {
            throw new Error(
              `Repeated material names detected in the same shelf`
            );
          }
          uniqueMaterialNamesSet.add(materialName);

          if (uniqueMaterialIdsSet.has(materialId as UUID)) {
            throw new Error(
              `Repeated material ids detected in the same shelf tree`
            );
          }
          uniqueMaterialIdsSet.add(materialId as UUID);

          materialNameCharacterCount += materialName.length;
        }

        encodedStructureByteSize += this.estimateSingleNodeSize(
          current,
          materialNameCharacterCount
        );

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

  /* ============================== Encoding & Decoding ============================== */

  public static encode(root: ShelfNode): Uint8Array {
    // Make sure to do the circular check first by using
    // either isChildrenCircular or analysisAndGenerateSummary()
    return msgpack.encode(root);
  }

  public static safeEncode(root: ShelfNode): Uint8Array {
    const { isSimple } = this.isChildrenSimple(root);
    if (!isSimple) {
      throw new Error("Failed to encode, cycle detected");
    }
    return msgpack.encode(root);
  }

  public static decode(data: Uint8Array): ShelfNode {
    return msgpack.decode(data) as ShelfNode;
  }

  public static safeDecode(data: Uint8Array): ShelfNode {
    const root = msgpack.decode(data, { rawStrings: false }) as ShelfNode;
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
  public static encodeToBase64(root: ShelfNode): string {
    const encoded = this.safeEncode(root);
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

  /* ============================== CRUD operations ============================== */

  public static createShelfNode(destination: ShelfNode, name: string) {
    const newId = crypto.randomUUID() as UUID;
    const newSubShelfNode: ShelfNode = {
      Id: newId,
      Name: name,
      Children: {},
      MaterialIdToName: {},
    };
    destination.Children[newId] = newSubShelfNode;
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

  public static deleteShelfNode(
    parent: ShelfNode,
    target: ShelfNode
  ): { id: UUID; name: string }[] {
    if (parent == target) return [];

    const deletedMaterials = this.getAllMaterials(target);
    delete parent.Children[target.Id];
    return deletedMaterials;
  }
}
