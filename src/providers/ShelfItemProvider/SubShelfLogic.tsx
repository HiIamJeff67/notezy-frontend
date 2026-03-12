import { getAuthorization } from "@/util/getAuthorization";
import { useGetMyBlockPacksByParentSubShelfId } from "@shared/api/hooks/blockPack.hook";
import { useGetMyMaterialsByParentSubShelfId } from "@shared/api/hooks/material.hook";
import {
  useCreateSubShelfByRootShelfId,
  useDeleteMySubShelfById,
  useGetMySubShelvesByPrevSubShelfId,
  useMoveMySubShelf,
  useUpdateMySubShelfById,
} from "@shared/api/hooks/subShelf.hook";
import { GetMyBlockPacksByParentSubShelfIdResponse } from "@shared/api/interfaces/blockPack.interface";
import { GetMyMaterialsByParentSubShelfIdResponse } from "@shared/api/interfaces/material.interface";
import { GetMySubShelvesByPrevSubShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LRUCache } from "@shared/lib/LRUCache";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import { RefObject, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface UseSubShelfLogicProps {
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

export const useSubShelfLogic = ({
  expandedShelvesRef,
  inputRef,
  setFocusedNode,
  forceUpdate,
}: UseSubShelfLogicProps) => {
  const getMySubShelvesBySubShelfQuerier = useGetMySubShelvesByPrevSubShelfId();
  const getMyMaterialsBySubShelfQuerier = useGetMyMaterialsByParentSubShelfId();
  const getMyBlockPacksBySubShelfQuerier =
    useGetMyBlockPacksByParentSubShelfId();

  const createSubShelfMutator = useCreateSubShelfByRootShelfId();
  const updateSubShelfMutator = useUpdateMySubShelfById();
  const deleteSubShelfMutator = useDeleteMySubShelfById();
  const moveSubShelfMutator = useMoveMySubShelf();

  const [editingSubShelfNode, setEditingSubShelfNode] = useState<
    SubShelfNode | undefined
  >(undefined);
  const [editSubShelfNodeName, setEditSubShelfNodeName] = useState<string>("");
  const [originalSubShelfNodeName, setOriginalSubShelfNodeName] =
    useState<string>("");

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingSubShelfNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingSubShelf();
        setEditingSubShelfNode(undefined);
        setEditSubShelfNodeName("");
        setOriginalSubShelfNodeName("");
      }
    };

    if (editingSubShelfNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    setTimeout(() => {
      if (editingSubShelfNode && inputRef.current) {
        inputRef.current?.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    editingSubShelfNode,
    editSubShelfNodeName, // will be used in renameEditingSubShelf
    originalSubShelfNodeName, // will be used in renameEditingSubShelf
    setEditingSubShelfNode,
    setEditSubShelfNodeName,
    setOriginalSubShelfNodeName,
  ]);

  const expandSubShelf = useCallback(
    async (
      rootShelfNode: RootShelfNode,
      subShelfNode: SubShelfNode
    ): Promise<void> => {
      // the isExpanded may be modified if the user just drag and drop something in below the `subShelfNode`
      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const authorization = getAuthorization(accessToken);
      const responseOfGettingSubShelves =
        (await getMySubShelvesBySubShelfQuerier.queryAsync({
          header: {
            userAgent: userAgent,
            authorization: authorization,
          },
          param: {
            prevSubShelfId: subShelfNode.id,
          },
        })) as GetMySubShelvesByPrevSubShelfIdResponse;
      const responseOfGettingMaterials =
        (await getMyMaterialsBySubShelfQuerier.queryAsync({
          header: {
            userAgent: userAgent,
            authorization: authorization,
          },
          param: {
            parentSubShelfId: subShelfNode.id,
          },
        })) as GetMyMaterialsByParentSubShelfIdResponse;
      const responseOfGettingBlockPacks =
        (await getMyBlockPacksBySubShelfQuerier.queryAsync({
          header: {
            userAgent: userAgent,
            authorization: authorization,
          },
          param: {
            parentSubShelfId: subShelfNode.id,
          },
        })) as GetMyBlockPacksByParentSubShelfIdResponse;
      SubShelfManipulator.initializeSubShelfNodesByResponse(
        rootShelfNode,
        subShelfNode,
        responseOfGettingSubShelves.data
      );
      SubShelfManipulator.initializeMaterialNodesByResponse(
        subShelfNode,
        responseOfGettingMaterials.data
      );
      SubShelfManipulator.initializeBlockPackNodesByResponse(
        subShelfNode,
        responseOfGettingBlockPacks.data
      );
      subShelfNode.isExpanded = true;
      forceUpdate();
    },
    [
      SubShelfManipulator,
      getMySubShelvesBySubShelfQuerier,
      getMyMaterialsBySubShelfQuerier,
      getMyBlockPacksBySubShelfQuerier,
    ]
  );

  const toggleSubShelf = (
    subShelfNode: SubShelfNode,
    reset: boolean = false
  ) => {
    subShelfNode.isOpen = reset ? false : !subShelfNode.isOpen;
    setFocusedNode(subShelfNode);
    forceUpdate();
  };

  const createSubShelf = useCallback(
    async (
      rootShelfId: UUID,
      prevSubShelfNode: SubShelfNode | null,
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
        LocalStorageKey.accessToken
      );
      const responseOfCreatingSubShelf =
        await createSubShelfMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            rootShelfId: rootShelfId,
            prevSubShelfId: prevSubShelfNode?.id ?? null,
            name: name,
          },
          affected: {
            rootShelfId: rootShelfId,
            prevSubShelfId: prevSubShelfNode?.id ?? null,
          },
        });

      shelfTreeSummary.hasChanged = true;
      shelfTreeSummary.root.subShelfCount++;
      if (prevSubShelfNode !== null) {
        shelfTreeSummary.maxDepth = Math.max(
          shelfTreeSummary.maxDepth,
          prevSubShelfNode.path.length + 1
        );
        shelfTreeSummary.maxWidth = Math.max(
          shelfTreeSummary.maxWidth,
          Object.entries(prevSubShelfNode.children).length +
            Object.entries(prevSubShelfNode.materialNodes).length +
            1
        );
        const newPath = prevSubShelfNode.path;
        newPath.push(prevSubShelfNode.id);
        prevSubShelfNode.children[responseOfCreatingSubShelf.data.id as UUID] =
          {
            id: responseOfCreatingSubShelf.data.id as UUID,
            rootShelfId: rootShelfId,
            prevSubShelfId: prevSubShelfNode.id as UUID,
            name: name,
            path: newPath,
            updatedAt: responseOfCreatingSubShelf.data.createdAt,
            createdAt: responseOfCreatingSubShelf.data.createdAt,
            isExpanded: true,
            children: {},
            materialNodes: {},
            blockPackNodes: {},
            isOpen: false,
            nodeType: "SubShelf",
          };
      } else {
        shelfTreeSummary.maxDepth = Math.max(shelfTreeSummary.maxDepth, 1);
        shelfTreeSummary.maxWidth = Math.max(shelfTreeSummary.maxWidth, 1);
        shelfTreeSummary.root.children[
          responseOfCreatingSubShelf.data.id as UUID
        ] = {
          id: responseOfCreatingSubShelf.data.id as UUID,
          rootShelfId: rootShelfId,
          prevSubShelfId: null,
          name: name,
          path: [],
          updatedAt: responseOfCreatingSubShelf.data.createdAt,
          createdAt: responseOfCreatingSubShelf.data.createdAt,
          isExpanded: true,
          children: {},
          materialNodes: {},
          blockPackNodes: {},
          isOpen: false,
          nodeType: "SubShelf",
        };
      }
      forceUpdate();
    },
    [expandedShelvesRef, createSubShelfMutator]
  );

  const isNewSubShelfNodeName = useCallback((): boolean => {
    return (
      editSubShelfNodeName !== originalSubShelfNodeName &&
      editSubShelfNodeName.trim() !== ""
    );
  }, [editSubShelfNodeName, originalSubShelfNodeName]);

  const isSubShelfNodeEditing = useCallback(
    (subShelfId: UUID): boolean => {
      return !!editingSubShelfNode && editingSubShelfNode.id === subShelfId;
    },
    [editingSubShelfNode]
  );

  const startRenamingSubShelfNode = useCallback(
    (subShelfNode: SubShelfNode): void => {
      setEditingSubShelfNode(subShelfNode);
      setOriginalSubShelfNodeName(subShelfNode.name);
      setEditSubShelfNodeName(subShelfNode.name);
    },
    [
      setEditingSubShelfNode,
      setOriginalSubShelfNodeName,
      setEditSubShelfNodeName,
    ]
  );

  const cancelRenamingSubShelfNode = useCallback((): void => {
    setEditingSubShelfNode(undefined);
    setOriginalSubShelfNodeName("");
    setEditSubShelfNodeName("");
  }, [
    setEditingSubShelfNode,
    setOriginalSubShelfNodeName,
    setEditSubShelfNodeName,
  ]);

  const renameEditingSubShelf = useCallback(async (): Promise<void> => {
    try {
      if (!isNewSubShelfNodeName() || !editingSubShelfNode) {
        toast.error("the name of the given sub shelf node is invalid");
        return;
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      await updateSubShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          subShelfId: editingSubShelfNode.id,
          values: {
            name: editSubShelfNodeName,
          },
        },
        affected: {
          rootShelfId: editingSubShelfNode.rootShelfId,
          prevSubShelfId: editingSubShelfNode.prevSubShelfId,
        },
      });

      // update the reference value stored in the useState value of `editingSubShelfNode`
      editingSubShelfNode.name = editSubShelfNodeName;
      setEditingSubShelfNode(prev =>
        prev ? { ...prev, name: editSubShelfNodeName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingSubShelfNode(undefined);
      setEditSubShelfNodeName("");
      setOriginalSubShelfNodeName("");
    }
  }, [
    editingSubShelfNode,
    editSubShelfNodeName,
    originalSubShelfNodeName,
    setEditingSubShelfNode,
    setEditSubShelfNodeName,
    setOriginalSubShelfNodeName,
    updateSubShelfMutator,
  ]);

  const deleteSubShelf = useCallback(
    async (
      prevSubShelfNode: SubShelfNode | null,
      subShelfNode: SubShelfNode
    ): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(
        subShelfNode.rootShelfId
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `subShelfNode not found in one of the children of rootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      await deleteSubShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          subShelfId: subShelfNode.id,
        },
        affected: {
          rootShelfId: subShelfNode.rootShelfId,
          prevSubShelfId: subShelfNode.prevSubShelfId,
        },
      });

      if (prevSubShelfNode === null) {
        delete shelfTreeSummary.root.children[subShelfNode.id];
      } else {
        delete prevSubShelfNode.children[subShelfNode.id];
      }
      shelfTreeSummary.hasChanged = true;
      forceUpdate();
    },
    [expandedShelvesRef, deleteSubShelfMutator]
  );

  const moveSubShelf = useCallback(
    async (
      prevSubShelfNode: SubShelfNode | null,
      sourceSubShelfNode: SubShelfNode,
      destinationRootShelfNode: RootShelfNode,
      destinationSubShelfNode: SubShelfNode | null
    ): Promise<void> => {
      const sourceSummary = expandedShelvesRef.current.get(
        sourceSubShelfNode.rootShelfId
      );
      if (sourceSummary === undefined) {
        throw new Error(
          `the sourceSubShelfNode does not belong to any valid root shelf node`
        );
      }
      const destinationSummary = expandedShelvesRef.current.get(
        destinationRootShelfNode.id
      );
      if (destinationSummary === undefined) {
        throw new Error(
          `the destinationSubShelfNode does not belong to any valid root shelf node or destinationRootShelfNode does not exist`
        );
      }

      if (
        destinationSubShelfNode !== null &&
        destinationSummary.root.id !== destinationSubShelfNode.rootShelfId
      ) {
        throw new Error(
          `the destinationSummary does not contain destinationSubShelfNode`
        );
      }
      if (
        sourceSubShelfNode !== null &&
        sourceSummary.root.id !== sourceSubShelfNode.rootShelfId
      ) {
        throw new Error(
          `the sourceSummary does not contain sourceSubShelfNode`
        );
      }

      const { childSubShelfNodes } =
        SubShelfManipulator.getAllChildSubShelfNodesAndMaterialNodes(
          sourceSubShelfNode
        );
      const childSubShelfIds = childSubShelfNodes.map(val => val.id);

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      await moveSubShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          sourceRootShelfId: sourceSubShelfNode.rootShelfId,
          sourceSubShelfId: sourceSubShelfNode.id,
          destinationRootShelfId: destinationRootShelfNode.id,
          destinationSubShelfId: destinationSubShelfNode?.id ?? null,
        },
        affected: {
          rootShelfId: sourceSubShelfNode.rootShelfId,
          childSubShelfIds: childSubShelfIds,
        },
      });

      const deletedSubShelfNode = sourceSubShelfNode;
      SubShelfManipulator.deleteSubShelfNode(
        sourceSummary,
        prevSubShelfNode,
        sourceSubShelfNode
      );
      SubShelfManipulator.insertSubShelfNode(
        destinationSummary,
        destinationSubShelfNode,
        deletedSubShelfNode
      );
      if (sourceSubShelfNode.rootShelfId !== destinationRootShelfNode.id) {
        deletedSubShelfNode.rootShelfId = destinationRootShelfNode.id;
      }
      deletedSubShelfNode.prevSubShelfId = destinationSubShelfNode?.id ?? null;
      forceUpdate();
    },
    [expandedShelvesRef, SubShelfManipulator, moveSubShelfMutator]
  );

  return {
    expandSubShelf: expandSubShelf,
    toggleSubShelf: toggleSubShelf,
    createSubShelf: createSubShelf,
    editSubShelfNodeName: editSubShelfNodeName,
    setEditSubShelfNodeName: setEditSubShelfNodeName,
    isNewSubShelfNodeName: isNewSubShelfNodeName,
    isSubShelfNodeEditing: isSubShelfNodeEditing,
    isAnySubShelfNodeEditing: editingSubShelfNode !== undefined,
    startRenamingSubShelfNode: startRenamingSubShelfNode,
    cancelRenamingSubShelfNode: cancelRenamingSubShelfNode,
    renameEditingSubShelf: renameEditingSubShelf,
    deleteSubShelf: deleteSubShelf,
    moveSubShelf: moveSubShelf,
  };
};
