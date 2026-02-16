import { getAuthorization } from "@/util/getAuthorization";
import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import {
  useCreateBlockPack,
  useDeleteMyBlockPackById,
  useUpdateMyBlockPackById,
} from "@shared/api/hooks/blockPack.hook";
import {
  useCreateNotebookMaterial,
  useCreateTextbookMaterial,
  useDeleteMyMaterialById,
  useUpdateMyMaterialById,
} from "@shared/api/hooks/material.hook";
import { AnalysisStatus, MaterialType } from "@shared/enums";
import { LRUCache } from "@shared/lib/LRUCache";
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import { RefObject, useCallback, useEffect, useState } from "react";

interface UseItemLogicProps {
  expandedShelvesRef: RefObject<LRUCache<string, ShelfTreeSummary>>;
  inputRef: RefObject<HTMLInputElement | null>;
  setFocusedNode: (
    node:
      | RootShelfNode
      | SubShelfNode
      | MaterialNode
      | BlockPackNode
      | undefined
  ) => void;
  forceUpdate: () => void;
}

export const useItemLogic = ({
  expandedShelvesRef,
  inputRef,
  setFocusedNode,
  forceUpdate,
}: UseItemLogicProps) => {
  const createTextbookMaterialMutator = useCreateTextbookMaterial();
  const createNotebookMaterialMutator = useCreateNotebookMaterial();
  const updateMaterialMutator = useUpdateMyMaterialById();
  const deleteMaterialMutator = useDeleteMyMaterialById();

  const createBlockPackMutator = useCreateBlockPack();
  const updateBlockPackMutator = useUpdateMyBlockPackById();
  const deleteBlockPackMutator = useDeleteMyBlockPackById();

  const [editingItemNode, setEditingItemNode] = useState<
    MaterialNode | BlockPackNode | undefined
  >(undefined);
  const [editItemNodeName, setEditItemNodeName] = useState<string>("");
  const [originalItemNodeName, setOriginalItemNodeName] = useState<string>("");

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingItemNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        if (editingItemNode.nodeType === "MATERIAL")
          await renameEditingMaterial(editingItemNode.type);

        setEditingItemNode(undefined);
        setEditItemNodeName("");
        setOriginalItemNodeName("");
      }
    };

    if (editingItemNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    setTimeout(() => {
      if (editingItemNode && inputRef.current) {
        inputRef.current?.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    editingItemNode,
    editItemNodeName, // will be used in renameEditingMaterial
    originalItemNodeName, // will be used in renameEditingMaterial
    setEditingItemNode,
    setEditItemNodeName,
    setOriginalItemNodeName,
  ]);

  const isNewItemNodeName = useCallback((): boolean => {
    return (
      editItemNodeName !== originalItemNodeName &&
      editItemNodeName.trim() !== ""
    );
  }, [editItemNodeName, originalItemNodeName]);

  const isItemNodeEditing = useCallback(
    (materialId: UUID): boolean => {
      return !!editingItemNode && editingItemNode.id === materialId;
    },
    [editingItemNode]
  );

  const startRenamingItemNode = useCallback(
    (itemNode: MaterialNode | BlockPackNode): void => {
      setEditingItemNode(itemNode);
      setOriginalItemNodeName(itemNode.name);
      setEditItemNodeName(itemNode.name);
    },
    [setEditingItemNode, setOriginalItemNodeName, setEditItemNodeName]
  );

  const cancelRenamingItemNode = useCallback((): void => {
    setEditingItemNode(undefined);
    setOriginalItemNodeName("");
    setEditItemNodeName("");
  }, [setEditingItemNode, setOriginalItemNodeName, setEditItemNodeName]);

  /* ==================== Materials ==================== */

  const toggleMaterial = (
    materialNode: MaterialNode,
    reset: boolean = false
  ) => {
    materialNode.isOpen = reset ? false : !materialNode.isOpen;
    setFocusedNode(materialNode);
    forceUpdate();
  };

  const createTextbookMaterial = useCallback(
    async (
      rootShelfId: UUID,
      parentSubShelfNode: SubShelfNode,
      name: string
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `The given rootShelfId is not exist in the expandedShelvesRef`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKeys.accessToken
      );
      const responseOfCreatingNotebookMaterial =
        await createTextbookMaterialMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            parentSubShelfId: parentSubShelfNode.id,
            name: name,
          },
          affected: {
            rootShelfId: rootShelfId,
            parentSubShelfId: parentSubShelfNode.id,
          },
        });
      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.subShelfCount++;
      if (parentSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          parentSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(parentSubShelfNode.children).length +
            Object.entries(parentSubShelfNode.materialNodes).length +
            1
        );
        parentSubShelfNode.materialNodes[
          responseOfCreatingNotebookMaterial.data.id as UUID
        ] = {
          id: responseOfCreatingNotebookMaterial.data.id as UUID,
          parentSubShelfId: parentSubShelfNode.id,
          name: name,
          type: MaterialType.Notebook,
          size: BigInt(0),
          downloadURL: responseOfCreatingNotebookMaterial.data.downloadURL,
          updatedAt: responseOfCreatingNotebookMaterial.data.createdAt,
          createdAt: responseOfCreatingNotebookMaterial.data.createdAt,
          isOpen: false,
          nodeType: "MATERIAL",
        };
        forceUpdate();
      }
    },
    [expandedShelvesRef, createTextbookMaterialMutator]
  );

  const createNotebookMaterial = useCallback(
    async (
      rootShelfId: UUID,
      parentSubShelfNode: SubShelfNode,
      name: string
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `The given rootShelfId is not exist in the expandedShelvesRef`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKeys.accessToken
      );
      const responseOfCreatingNotebookMaterial =
        await createNotebookMaterialMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            parentSubShelfId: parentSubShelfNode.id,
            name: name,
          },
          affected: {
            rootShelfId: rootShelfId,
            parentSubShelfId: parentSubShelfNode.id,
          },
        });
      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.itemCount++;
      if (parentSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          parentSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(parentSubShelfNode.children).length +
            Object.entries(parentSubShelfNode.materialNodes).length +
            1
        );
        parentSubShelfNode.materialNodes[
          responseOfCreatingNotebookMaterial.data.id as UUID
        ] = {
          id: responseOfCreatingNotebookMaterial.data.id as UUID,
          parentSubShelfId: parentSubShelfNode.id,
          name: name,
          type: MaterialType.Notebook,
          size: BigInt(0),
          downloadURL: responseOfCreatingNotebookMaterial.data.downloadURL,
          updatedAt: responseOfCreatingNotebookMaterial.data.createdAt,
          createdAt: responseOfCreatingNotebookMaterial.data.createdAt,
          isOpen: false,
          nodeType: "MATERIAL",
        };
        forceUpdate();
      }
    },
    [expandedShelvesRef, createNotebookMaterialMutator]
  );

  const renameEditingMaterial = useCallback(
    async (materialType: MaterialType): Promise<void> => {
      try {
        if (
          !isNewItemNodeName() ||
          !editingItemNode ||
          editingItemNode.nodeType !== "MATERIAL"
        ) {
          throw new Error("the name of the given material node is invalid");
        }

        const userAgent = navigator.userAgent;
        const accessToken = LocalStorageManipulator.getItemByKey(
          LocalStorageKeys.accessToken
        );
        await updateMaterialMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            materialId: editingItemNode.id,
            values: {
              name: editItemNodeName,
            },
            type: materialType,
          },
          affected: {
            parentSubShelfId: editingItemNode.parentSubShelfId,
          },
        });

        editingItemNode.name = editItemNodeName;
        setEditingItemNode(prev =>
          prev ? { ...prev, name: editItemNodeName } : undefined
        );
        forceUpdate();
      } catch (error) {
        throw error;
      } finally {
        setEditingItemNode(undefined);
        setEditItemNodeName("");
        setOriginalItemNodeName("");
      }
    },
    [
      editingItemNode,
      editItemNodeName,
      originalItemNodeName,
      setEditingItemNode,
      setEditItemNodeName,
      setOriginalItemNodeName,
      updateMaterialMutator,
    ]
  );

  const deleteMaterial = useCallback(
    async (
      parentSubShelfNode: SubShelfNode,
      materialNode: MaterialNode
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(
        parentSubShelfNode.rootShelfId as UUID
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `parentSubShelfNode not found in one of the children of rootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKeys.accessToken
      );
      await deleteMaterialMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          materialId: materialNode.id,
        },
        affected: {
          rootShelfId: parentSubShelfNode.rootShelfId,
          parentSubShelfId: parentSubShelfNode.id,
        },
      });

      delete parentSubShelfNode.materialNodes[materialNode.id];
      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.estimatedByteSize = Math.max(
        0,
        RootShelfManipulator.estimateMaterialNode(materialNode)
      );
      // the maxWidth and maxDepth is unknown in this point
      shelfTreeSummary.analysisStatus = AnalysisStatus.OnlySubShelves;
      forceUpdate();
    },
    [expandedShelvesRef, deleteMaterialMutator, RootShelfManipulator]
  );

  /* ==================== BlockPack ==================== */

  const toggleBlockPack = useCallback(
    (blockPackNode: BlockPackNode, reset?: boolean) => {
      blockPackNode.isOpen = reset ? false : !blockPackNode.isOpen;
      setFocusedNode(blockPackNode);
      forceUpdate();
    },
    []
  );

  const createBlockPack = useCallback(
    async (
      rootShelfId: UUID,
      parentSubShelfNode: SubShelfNode,
      name: string
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `The given rootShelfId is not exist in the expandedShelvesRef`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKeys.accessToken
      );
      const responseOfCreatingBlockPack =
        await createBlockPackMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            parentSubShelfId: parentSubShelfNode.id,
            name: name,
            icon: null,
            headerBackgroundURL: null,
          },
          affected: {
            rootShelfId: rootShelfId,
            parentSubShelfId: parentSubShelfNode.id,
          },
        });

      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.itemCount++;
      if (parentSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          parentSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(parentSubShelfNode.children).length +
            Object.entries(parentSubShelfNode.blockPackNodes).length +
            1
        );
        parentSubShelfNode.blockPackNodes[
          responseOfCreatingBlockPack.data.id as UUID
        ] = {
          id: responseOfCreatingBlockPack.data.id as UUID,
          parentSubShelfId: parentSubShelfNode.id,
          name: name,
          icon: null,
          headerBackgroundURL: null,
          blockCount: 0,
          updatedAt: responseOfCreatingBlockPack.data.createdAt,
          createdAt: responseOfCreatingBlockPack.data.createdAt,
          isOpen: false,
          nodeType: "BLOCK_PACK",
        };
        forceUpdate();
      }
    },
    [expandedShelvesRef, createBlockPackMutator]
  );

  const renameEditingBlockPack = useCallback(async (): Promise<void> => {
    try {
      if (
        !isNewItemNodeName() ||
        !editingItemNode ||
        editingItemNode.nodeType !== "BLOCK_PACK"
      ) {
        throw new Error("the name of the given block pack node is invalid");
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKeys.accessToken
      );
      await updateBlockPackMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          blockPackId: editingItemNode.id,
          values: {
            name: editItemNodeName,
          },
        },
        affected: {
          parentSubShelfId: editingItemNode.parentSubShelfId,
        },
      });

      editingItemNode.name = editItemNodeName;
      setEditingItemNode(prev =>
        prev ? { ...prev, name: editItemNodeName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingItemNode(undefined);
      setEditItemNodeName("");
      setOriginalItemNodeName("");
    }
  }, [
    editItemNodeName,
    originalItemNodeName,
    setEditingItemNode,
    setEditItemNodeName,
    setOriginalItemNodeName,
    updateBlockPackMutator,
  ]);

  const deleteBlockPack = useCallback(
    async (
      parentSubShelfNode: SubShelfNode,
      blockPackNode: BlockPackNode
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(
        parentSubShelfNode.rootShelfId as UUID
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `parentSubShelfNode not found in one of the children of rootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKeys.accessToken
      );
      await deleteBlockPackMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          blockPackId: blockPackNode.id,
        },
        affected: {
          rootShelfId: parentSubShelfNode.rootShelfId,
          parentSubShelfId: parentSubShelfNode.id,
        },
      });

      delete parentSubShelfNode.blockPackNodes[blockPackNode.id];
      shelfTreeSummary.hasChanged = true;
      // the maxWidth and maxDepth is unknown in this point
      shelfTreeSummary.analysisStatus = AnalysisStatus.OnlySubShelves;
      forceUpdate();
    },
    [expandedShelvesRef, deleteBlockPackMutator]
  );

  return {
    editItemNodeName: editItemNodeName,
    setEditItemNodeName: setEditItemNodeName,
    isNewItemNodeName: isNewItemNodeName,
    isItemNodeEditing: isItemNodeEditing,
    isAnyItemNodeEditing: editingItemNode !== undefined,
    startRenamingItemNode: startRenamingItemNode,
    cancelRenamingItemNode: cancelRenamingItemNode,
    toggleMaterial: toggleMaterial,
    createTextbookMaterial: createTextbookMaterial,
    createNotebookMaterial: createNotebookMaterial,
    renameEditingMaterial: renameEditingMaterial,
    deleteMaterial: deleteMaterial,
    toggleBlockPack: toggleBlockPack,
    createBlockPack: createBlockPack,
    renameEditingBlockPack: renameEditingBlockPack,
    deleteBlockPack: deleteBlockPack,
  };
};
