import { GetAllMyMaterialsByParentSubShelfIdResponse } from "@shared/api/interfaces/material.interface";
import {
  MaxMaterialsOfRootShelf,
  MaxSubShelvesOfRootShelf,
} from "@shared/constants";
import {
  AnalysisStatus,
  MaterialNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";
import { UUID } from "crypto";

export class SubShelfManipulator {
  private static maxTraverseCount: number =
    MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf;

  constructor(
    maxTraverseCount: number = MaxSubShelvesOfRootShelf +
      MaxMaterialsOfRootShelf
  ) {
    SubShelfManipulator.maxTraverseCount = Math.min(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf,
      maxTraverseCount
    );
  }

  /* ============================== Max Traverse Count Getter & Setter ============================== */

  public static getMaxTraverseCount(): number {
    return SubShelfManipulator.maxTraverseCount;
  }

  public static setMaxTraverseCount(value: number): void {
    SubShelfManipulator.maxTraverseCount = Math.min(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf,
      value
    );
  }

  /* ============================== Initialization ============================== */

  public static initializeMaterialNodesByResponse(
    subShelfNode: SubShelfNode,
    responseOfMaterials: GetAllMyMaterialsByParentSubShelfIdResponse
  ): SubShelfNode {
    for (const material of responseOfMaterials.data) {
      if (material.parentSubShelfId !== subShelfNode.id) {
        throw new Error(`Insert materials to wrong parent sub shelf`);
      }

      const newMaterialNode: MaterialNode = {
        id: material.id as UUID,
        parentSubShelfId: subShelfNode.id as UUID,
        name: material.name,
        type: material.type,
        downloadURL: material.downloadURL,
        contentType: material.contentType,
        parseMediaType: material.parseMediaType,
        updatedAt: material.updatedAt,
        createdAt: material.createdAt,
      };
      subShelfNode.materialNodes[material.id as UUID] = newMaterialNode;
    }
    subShelfNode.isExpanded = true;

    return subShelfNode;
  }

  /* ============================== Algorithms ============================== */

  /* Check if `desiredChild` is a child of `desiredParent` */
  public static isChild(
    desiredParent: SubShelfNode,
    desiredChild: SubShelfNode
  ): boolean {
    if (desiredParent == desiredChild) return false;

    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [desiredParent];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > SubShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${SubShelfManipulator.maxTraverseCount}`
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

  public static isChildByPath(
    desiredParent: SubShelfNode,
    desiredChild: SubShelfNode
  ): boolean {
    if (desiredParent === desiredChild) return false;

    let remaining = desiredChild.path.length; // early break
    for (const parentId of desiredChild.path) {
      if (parentId === desiredParent.id) {
        return true;
      }
      if (remaining <= desiredParent.path.length) {
        return false;
      }
      remaining--;
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
    desiredParent: SubShelfNode,
    desiredChild: SubShelfNode
  ): { width: number; subWidth: number; depth: number } {
    if (desiredParent == desiredChild)
      return {
        width: 1,
        subWidth: Object.entries(desiredParent.children).length,
        depth: 0,
      };

    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [desiredParent];

    while (queue.length > 0) {
      let levelSize = queue.length;
      const currentWidth = levelSize;
      let isFound = false;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > SubShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${SubShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        if (current.id == desiredChild.id) {
          isFound = true;
          // don't return here, wait until the while(the current layer) done
        }

        for (const child of Object.values(current.children)) {
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

  public static getAllChildSubShelfNodesAndMaterialNodes(
    subShelfNode: SubShelfNode
  ): {
    childSubShelfNodes: SubShelfNode[];
    materialNodes: MaterialNode[];
  } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const uniqueSubShelfNodes: Record<UUID, SubShelfNode> = {};
    const uniqueMaterialNodes: Record<UUID, MaterialNode> = {};
    const queue: SubShelfNode[] = [subShelfNode];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > SubShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${SubShelfManipulator.maxTraverseCount}`
          );
        }
        traverseCount++;

        const current = queue.shift();
        if (current === undefined) continue; // this should be never executed

        if (visited.has(current.id)) {
          return { childSubShelfNodes: [], materialNodes: [] };
        }
        visited.add(current.id);

        for (const [materialId, materialNode] of Object.entries(
          current.materialNodes
        )) {
          uniqueMaterialNodes[materialId as UUID] = materialNode;
        }

        for (const [childId, child] of Object.entries(current.children)) {
          uniqueSubShelfNodes[childId as UUID] = child;
          queue.push(child);
        }
      }
    }

    return {
      childSubShelfNodes: Object.values(uniqueSubShelfNodes),
      materialNodes: Object.values(uniqueMaterialNodes),
    };
  }

  public static isChildrenSimple(subShelfNode: SubShelfNode): {
    isSimple: boolean;
    cycleNode: SubShelfNode | null;
  } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [subShelfNode];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > SubShelfManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${SubShelfManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          return { isSimple: false, cycleNode: current };
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
      isSimple: true,
      cycleNode: null,
    };
  }

  public static insertSubShelfNode(
    parentSummary: ShelfTreeSummary,
    parentSubShelfNode: SubShelfNode | null,
    newSubShelfNode: SubShelfNode
  ) {
    if (parentSubShelfNode !== null) {
      if (parentSummary.root.id !== parentSubShelfNode.rootShelfId) {
        throw new Error(
          `the root id of parentSummary is not equal to the root id of parentSubShelfNode`
        );
      }
    }

    // insert the `subShelfNode` into `parentSubShelfNode`
    if (parentSubShelfNode === null) {
      parentSummary.root.children[newSubShelfNode.id] = newSubShelfNode;
    } else {
      parentSubShelfNode.children[newSubShelfNode.id] = newSubShelfNode;
    }

    parentSummary.analysisStatus = AnalysisStatus.Unexplored;
    parentSummary.hasChanged = true;
  }

  public static deleteSubShelfNode(
    summary: ShelfTreeSummary,
    parentSubShelfNode: SubShelfNode | null,
    subShelfNode: SubShelfNode
  ) {
    if (summary.root.id !== subShelfNode.rootShelfId) {
      throw new Error(
        `the root id of summary is not equal to the root id of subShelfNode`
      );
    }
    if (
      parentSubShelfNode !== null &&
      summary.root.id !== parentSubShelfNode.rootShelfId
    ) {
      throw new Error(
        `the root id of summary is not equal to the root id of parentSubShelfNode`
      );
    }

    const deletedSubShelfNode = subShelfNode;

    if (parentSubShelfNode === null) {
      delete summary.root.children[subShelfNode.id];
    } else {
      delete parentSubShelfNode.children[subShelfNode.id];
    }

    return deletedSubShelfNode;
  }
}
