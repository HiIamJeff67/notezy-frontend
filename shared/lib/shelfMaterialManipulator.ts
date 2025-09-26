import { GetAllMyMaterialsByParentSubShelfIdResponse } from "@shared/api/interfaces/material.interface";
import { GetAllMySubShelvesByRootShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import {
  MaxMaterialsOfRootShelf,
  MaxSubShelvesOfRootShelf,
} from "@shared/constants";
import {
  MaterialNode,
  RootShelfNode,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";
import { UUID } from "crypto";

export enum AnalysisStatus {
  Explored = "Explored",
  OnlySubShelves = "OnlySubShelves",
  OnlyMaterials = "OnlyMaterials",
  Unexplored = "Unexplored",
}

// This shelf summary structure maybe different from the backend,
// Since we may require more information for the client user
export interface ShelfTreeSummary {
  root: RootShelfNode;
  estimatedByteSize: number;
  hasChanged: boolean;
  analysisStatus: AnalysisStatus;
  maxWidth: number;
  maxDepth: number;
  uniqueMaterialIds: UUID[];
}

export class ShelfMaterialManipulator {
  private static maxTraverseCount: number =
    MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf;
  private static readonly BYTES_UUID_STRING = 72; // 36 chars * 2 bytes
  private static readonly BYTES_DATE = 24; // Date 物件粗估
  private static readonly BYTES_PTR = 8; // 64-bit 指標/參考
  private static readonly BYTES_OBJ_HEADER = 32; // 物件 header 粗估
  private static readonly BYTES_ARRAY_HEADER = 24; // 陣列 header 粗估
  private static readonly BYTES_MAP_HEADER = 32; // 物件作為 map 的粗估

  constructor(
    maxTraverseCount: number = MaxSubShelvesOfRootShelf +
      MaxMaterialsOfRootShelf
  ) {
    ShelfMaterialManipulator.maxTraverseCount = Math.min(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf,
      maxTraverseCount
    );
  }

  public static getMaxTraverseCount(): number {
    return ShelfMaterialManipulator.maxTraverseCount;
  }

  public static setMaxTraverseCount(value: number): void {
    ShelfMaterialManipulator.maxTraverseCount = Math.min(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf,
      value
    );
  }

  private static estimateSubShelfNode(subShelfNode: SubShelfNode): number {
    const nameBytes = (subShelfNode.name?.length ?? 0) * 2;
    const pathCount = subShelfNode.path?.length ?? 0;
    const childrenCount = Object.keys(subShelfNode.children).length;
    const materialCount = Object.keys(subShelfNode.materialNodes).length;

    let size =
      this.BYTES_OBJ_HEADER + // SubShelfNode 物件本身
      this.BYTES_UUID_STRING + // id
      this.BYTES_UUID_STRING + // rootShelfId
      (subShelfNode.prevSubShelfId ? this.BYTES_UUID_STRING : this.BYTES_PTR) + // prevSubShelfId or null
      3 * this.BYTES_DATE + // deletedAt/updatedAt/createdAt
      nameBytes;

    // path: 陣列 header + 每個元素（ref + UUID 字串）
    size +=
      this.BYTES_ARRAY_HEADER +
      pathCount * (this.BYTES_PTR + this.BYTES_UUID_STRING);

    // children: 物件作為 map（header + 每個 entry：key(UUID字串) + value 指標）
    size +=
      this.BYTES_MAP_HEADER +
      childrenCount * (this.BYTES_UUID_STRING + this.BYTES_PTR);

    // materialNodes: 同上
    size +=
      this.BYTES_MAP_HEADER +
      materialCount * (this.BYTES_UUID_STRING + this.BYTES_PTR);

    return size;
  }

  private static estimateMaterialNode(materialNode: MaterialNode): number {
    return (
      this.BYTES_OBJ_HEADER + // 物件本身
      2 * this.BYTES_UUID_STRING + // id + parentSubShelfId
      (materialNode.name?.length ?? 0) * 2 +
      (materialNode.type?.toString()?.length ?? 0) * 2 +
      (materialNode.downloadURL?.length ?? 0) * 2 +
      (materialNode.contentType?.toString()?.length ?? 0) * 2 +
      (materialNode.parseMediaType?.length ?? 0) * 2 +
      3 * this.BYTES_DATE // deletedAt/updatedAt/createdAt
    );
  }

  /* ============================== Initialization ============================== */

  public static initializeSubShelfNodeTreeByResponse(
    newRootShelfNode: RootShelfNode,
    responseOfSubShelves: GetAllMySubShelvesByRootShelfIdResponse
  ): RootShelfNode {
    let i = 0,
      prevSubShelfNodes: Record<UUID, SubShelfNode> = {},
      curSubShelfNodes: Record<UUID, SubShelfNode> = {};
    const visitedSubShelfIds: Set<UUID> = new Set();
    responseOfSubShelves.data.sort((a, b) => a.path.length - b.path.length);
    // initialize the first layer
    for (const subShelf of responseOfSubShelves.data) {
      if (subShelf.prevSubShelfId !== null || subShelf.path.length !== 0) break;

      if (visitedSubShelfIds.has(subShelf.id as UUID)) {
        throw new Error(`Duplicate subShelf id: ${subShelf.id}`);
      }
      visitedSubShelfIds.add(subShelf.id as UUID);

      const newSubShelfNode: SubShelfNode = {
        id: subShelf.id as UUID,
        rootShelfId: newRootShelfNode.id,
        prevSubShelfId: null,
        name: subShelf.name,
        path: [],
        deletedAt: subShelf.deletedAt,
        updatedAt: subShelf.updatedAt,
        createdAt: subShelf.createdAt,
        children: {},
        materialNodes: {},
      };
      newRootShelfNode.children[subShelf.id as UUID] = newSubShelfNode;
      prevSubShelfNodes[newSubShelfNode.id] =
        newRootShelfNode.children[subShelf.id as UUID];
      i++;
    }

    if (Object.entries(prevSubShelfNodes).length === 0) return newRootShelfNode;

    // construct the entire sub shelf structure
    const n = responseOfSubShelves.data.length;
    const maxPathLength =
      responseOfSubShelves.data[responseOfSubShelves.data.length - 1]?.path
        ?.length ?? 0;
    for (
      let pathLength = 1;
      i < n && pathLength <= maxPathLength;
      pathLength++
    ) {
      if (responseOfSubShelves.data[i].path.length !== pathLength) break; // it is impossible that lhs < rhs

      while (i < n && responseOfSubShelves.data[i].path.length === pathLength) {
        if (responseOfSubShelves.data[i].prevSubShelfId === null) {
          throw new Error(`Null prev sub shelf id detected`);
        }
        if (visitedSubShelfIds.has(responseOfSubShelves.data[i].id as UUID)) {
          throw new Error(
            `Duplicate subShelf id: ${responseOfSubShelves.data[i].id}`
          );
        }
        visitedSubShelfIds.add(responseOfSubShelves.data[i].id as UUID);

        const newSubShelfNode: SubShelfNode = {
          id: responseOfSubShelves.data[i].id as UUID,
          rootShelfId: newRootShelfNode.id,
          prevSubShelfId: responseOfSubShelves.data[i].prevSubShelfId as UUID,
          name: responseOfSubShelves.data[i].name,
          path: responseOfSubShelves.data[i].path as UUID[],
          deletedAt: responseOfSubShelves.data[i].deletedAt,
          updatedAt: responseOfSubShelves.data[i].updatedAt,
          createdAt: responseOfSubShelves.data[i].createdAt,
          children: {},
          materialNodes: {},
        };

        if (
          prevSubShelfNodes[newSubShelfNode.prevSubShelfId as UUID] === null ||
          prevSubShelfNodes[
            newSubShelfNode.path[newSubShelfNode.path.length - 1]
          ] === null
        ) {
          throw new Error(
            `Parent subShelf with ID ${newSubShelfNode.prevSubShelfId} not found for child ${newSubShelfNode.id}`
          );
        }
        prevSubShelfNodes[newSubShelfNode.prevSubShelfId as UUID].children[
          newSubShelfNode.id as UUID
        ] = newSubShelfNode;
        curSubShelfNodes[newSubShelfNode.id] = newSubShelfNode;
        i++;
      }

      prevSubShelfNodes = curSubShelfNodes;
      curSubShelfNodes = {};
    }

    return newRootShelfNode;
  }

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
        deletedAt: material.deletedAt,
        updatedAt: material.updatedAt,
        createdAt: material.createdAt,
      };
      subShelfNode.materialNodes[material.id as UUID] = newMaterialNode;
    }

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
        if (traverseCount > ShelfMaterialManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfMaterialManipulator.maxTraverseCount}`
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
        if (traverseCount > ShelfMaterialManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfMaterialManipulator.maxTraverseCount}`
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

  public static getAllMaterials(
    node: SubShelfNode
  ): { id: UUID; name: string }[] {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [node];
    const uniqueMaterials: Record<UUID, string> = {};

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > ShelfMaterialManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfMaterialManipulator.maxTraverseCount}`
          );
        }

        const current = queue.shift()!;
        traverseCount++;

        if (visited.has(current.id)) {
          return [];
        }
        visited.add(current.id);

        for (const [materialId, material] of Object.entries(
          current.materialNodes
        )) {
          if (material !== null) {
            uniqueMaterials[materialId as UUID] = material.name;
          }
        }

        for (const child of Object.values(current.children)) {
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

  public static isChildrenSimple(root: SubShelfNode): {
    isSimple: boolean;
    cycleNode: SubShelfNode | null;
  } {
    let traverseCount: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0;

    const visited: Set<UUID> = new Set<UUID>();
    const queue: SubShelfNode[] = [root];

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (traverseCount > ShelfMaterialManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations of ${traverseCount} exceeded the limit of ${ShelfMaterialManipulator.maxTraverseCount}`
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

  public static analysisAndGenerateSummary(
    rootShelfNode: RootShelfNode
  ): ShelfTreeSummary {
    let totalShelfNodes: number = 0,
      maxWidth: number = 0,
      maxDepth: number = 0,
      estimatedByteSize: number = 0;

    const queue: SubShelfNode[] = [];
    for (const subShelf of Object.values(rootShelfNode.children)) {
      queue.push(subShelf);
    }
    const visited: Set<UUID> = new Set<UUID>();
    const uniqueMaterialIdsSet: Set<UUID> = new Set<UUID>();

    while (queue.length > 0) {
      let levelSize = queue.length;
      maxWidth = Math.max(maxWidth, levelSize);
      maxDepth++;

      while (levelSize--) {
        if (totalShelfNodes > ShelfMaterialManipulator.maxTraverseCount) {
          throw new Error(
            `Maximum iterations (${ShelfMaterialManipulator.maxTraverseCount}) exceeded`
          );
        }

        const current = queue.shift()!;
        totalShelfNodes++;

        if (visited.has(current.id)) {
          throw new Error(`Cycle detected at node: ${current.id}`);
        }
        visited.add(current.id);

        const uniqueMaterialNamesSet: Set<string> = new Set<string>();

        for (const [materialId, material] of Object.entries(
          current.materialNodes
        )) {
          if (uniqueMaterialNamesSet.has(material.name)) {
            throw new Error(
              `Repeated material names detected in the same shelf`
            );
          }
          uniqueMaterialNamesSet.add(material.name);

          if (uniqueMaterialIdsSet.has(materialId as UUID)) {
            throw new Error(
              `Repeated material ids detected in the same shelf tree`
            );
          }
          uniqueMaterialIdsSet.add(materialId as UUID);

          estimatedByteSize += this.estimateMaterialNode(material);
        }

        estimatedByteSize += this.estimateSubShelfNode(current);

        for (const child of Object.values(current.children)) {
          if (child) queue.push(child);
        }
      }
    }
    rootShelfNode.totalShelfNodes = totalShelfNodes;
    rootShelfNode.totalMaterials = uniqueMaterialIdsSet.size;

    return {
      root: rootShelfNode,
      estimatedByteSize: estimatedByteSize,
      hasChanged: false,
      analysisStatus: AnalysisStatus.Explored,
      maxWidth: maxWidth,
      maxDepth: maxDepth,
      uniqueMaterialIds: Array.from(uniqueMaterialIdsSet),
    };
  }
}
