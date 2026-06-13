import {
  PrivateRootShelf,
  SearchRootShelfEdge,
  SearchRootShelfSortBy,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@shared/api/graphql/hooks/useSearchShelves";
import {
  useCreateRootShelf,
  useDeleteMyRootShelfById,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import { useGetAllMySubShelvesByRootShelfId } from "@shared/api/hooks/subShelf.hook";
import { MaxSearchLimit } from "@shared/constants";
import { AnalysisStatus } from "@shared/enums";
import { LRUCache } from "@shared/lib/LRUCache";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import toast from "@shared/lib/toast";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { RefObject, useCallback, useEffect, useState } from "react";

interface UseRootShelfLogicProps {
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

export const useRootShelfLogic = ({
  expandedShelvesRef,
  inputRef,
  setFocusedNode,
  forceUpdate,
}: UseRootShelfLogicProps) => {
  const getAllSubShelvesQuerier = useGetAllMySubShelvesByRootShelfId();
  const createRootShelfMutator = useCreateRootShelf();
  const updateRootShelfMutator = useUpdateMyRootShelfById();
  const deleteRootShelfMutator = useDeleteMyRootShelfById();

  const [searchInput, setSearchInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });

  const [editingRootShelfNode, setEditingRootShelfNode] = useState<
    RootShelfNode | undefined
  >(undefined);
  const [editRootShelfName, setEditRootShelfName] = useState<string>("");
  const [originalRootShelfName, setOriginalRootShelfName] =
    useState<string>("");

  const [executeSearch, { data, loading, fetchMore }] =
    useSearchRootShelvesLazyQuery();

  // fetch some root shelves initially
  useEffect(() => {
    if (
      data !== undefined &&
      data.searchRootShelves !== undefined &&
      data.searchRootShelves.searchEdges !== undefined
    ) {
      for (const edge of data.searchRootShelves
        .searchEdges as SearchRootShelfEdge[]) {
        if (expandedShelvesRef.current.get(edge.node.id) === undefined) {
          const shelfTreeSummary: ShelfTreeSummary = {
            root: {
              id: edge.node.id,
              name: edge.node.name,
              subShelfCount: edge.node.subShelfCount,
              itemCount: edge.node.itemCount,
              lastAnalyzedAt: edge.node.lastAnalyzedAt,
              updatedAt: edge.node.updatedAt,
              createdAt: edge.node.createdAt,
              isExpanded: false,
              children: {},
              isOpen: false,
              nodeType: "RootShelf",
            },
            estimatedByteSize: 0, // may use some field to store the size of rootShelf,
            hasChanged: false,
            analysisStatus: AnalysisStatus.Unexplored,
            maxWidth: 0,
            maxDepth: 0,
          };
          expandedShelvesRef.current.set(edge.node.id, shelfTreeSummary);
        }
      }
      forceUpdate();
    }
  }, [data]);

  const searchRootShelves = useCallback(async (): Promise<void> => {
    await executeSearch({
      variables: {
        input: {
          ...searchInput,
          first: MaxSearchLimit,
          sortBy: SearchRootShelfSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
        },
      },
    }).retain();
  }, [executeSearch, searchInput]);

  const loadMoreRootShelves = useCallback(async (): Promise<void> => {
    const searchRootShelvesConnection = data?.searchRootShelves;
    const searchEdges = searchRootShelvesConnection?.searchEdges ?? [];

    if (!searchRootShelvesConnection || searchEdges.length === 0) return;

    const pageInfo = searchRootShelvesConnection?.searchPageInfo;
    if (!pageInfo || !pageInfo.hasNextPage) return;

    await fetchMore({
      variables: {
        input: {
          ...searchInput,
          first: MaxSearchLimit,
          sortBy: SearchRootShelfSortBy.Name,
          sortOrder: SearchSortOrder.Asc,
          after: pageInfo.endEncodedSearchCursor,
        },
      },
    });
  }, [data, fetchMore, searchInput]);

  const expandRootShelf = async (
    rootShelf: PrivateRootShelf
  ): Promise<ShelfTreeSummary> => {
    const shelfTreeSummary = expandedShelvesRef.current.get(rootShelf.id);
    if (shelfTreeSummary === undefined) {
      throw new Error(`root shelf does not exist`);
    }

    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const responseOfGettingAllSubShelves = await getAllSubShelvesQuerier.fetch({
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      param: {
        rootShelfId: rootShelf.id,
      },
    });

    const newRootShelfNode =
      RootShelfManipulator.initializeSubShelfNodeTreeByResponse(
        shelfTreeSummary.root,
        responseOfGettingAllSubShelves
      );
    shelfTreeSummary.root = newRootShelfNode;
    shelfTreeSummary.root.isExpanded = true;
    shelfTreeSummary.analysisStatus = AnalysisStatus.Unexplored;
    expandedShelvesRef.current.set(rootShelf.id, shelfTreeSummary);
    forceUpdate();
    return shelfTreeSummary;
  };

  const toggleRootShelf = (
    rootShelfNode: RootShelfNode,
    reset: boolean = false
  ) => {
    rootShelfNode.isOpen = reset ? false : !rootShelfNode.isOpen;
    setFocusedNode(rootShelfNode);
    forceUpdate();
  };

  const createRootShelf = useCallback(
    async (name: string): Promise<void> => {
      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const responseOfCreatingRootShelf =
        await createRootShelfMutator.mutateAsync({
          header: {
            userAgent: userAgent,
            authorization: getAuthorization(accessToken),
          },
          body: {
            name: name,
          },
        });

      const shelfTreeSummary: ShelfTreeSummary =
        RootShelfManipulator.analysisAndGenerateSummary({
          id: responseOfCreatingRootShelf.data.id as UUID,
          name: name,
          subShelfCount: 0,
          itemCount: 0,
          lastAnalyzedAt: responseOfCreatingRootShelf.data.lastAnalyzedAt,
          updatedAt: responseOfCreatingRootShelf.data.createdAt,
          createdAt: responseOfCreatingRootShelf.data.createdAt,
          isExpanded: true,
          children: {},
          isOpen: false,
          nodeType: "RootShelf",
        });
      expandedShelvesRef.current.set(
        responseOfCreatingRootShelf.data.id as UUID,
        shelfTreeSummary
      );
      forceUpdate();
    },
    [createRootShelfMutator, RootShelfManipulator, expandedShelvesRef]
  );

  const isNewRootShelfName = useCallback(() => {
    return (
      editRootShelfName !== originalRootShelfName &&
      editRootShelfName.trim() !== ""
    );
  }, [editRootShelfName, originalRootShelfName]);

  const isRootShelfNodeEditing = useCallback(
    (rootShelfId: UUID) => {
      return !!editingRootShelfNode && editingRootShelfNode.id === rootShelfId;
    },
    [editingRootShelfNode]
  );

  const startRenamingRootShelfNode = useCallback(
    (rootShelfNode: RootShelfNode) => {
      setEditingRootShelfNode(rootShelfNode);
      setOriginalRootShelfName(rootShelfNode.name);
      setEditRootShelfName(rootShelfNode.name);
    },
    [setEditingRootShelfNode, setOriginalRootShelfName, setEditRootShelfName]
  );

  const cancelRenamingRootShelfNode = useCallback(() => {
    setEditingRootShelfNode(undefined);
    setOriginalRootShelfName("");
    setEditRootShelfName("");
  }, [setEditingRootShelfNode, setOriginalRootShelfName, setEditRootShelfName]);

  const renameEditingRootShelf = useCallback(async (): Promise<void> => {
    try {
      if (!isNewRootShelfName() || !editingRootShelfNode) {
        toast.error("the name of the given root shelf node is invalid");
        return;
      }

      const shelfTreeSummary = expandedShelvesRef.current.get(
        editingRootShelfNode.id
      );
      if (shelfTreeSummary === undefined) {
        throw new Error(
          `parentShelfNode not found in one of the children of editingRootShelfNode`
        );
      }

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      await updateRootShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          rootShelfId: editingRootShelfNode.id,
          values: {
            name: editRootShelfName,
          },
        },
      });

      shelfTreeSummary.root.name = editRootShelfName;
      editingRootShelfNode.name = editRootShelfName;
      setEditingRootShelfNode(prev =>
        prev ? { ...prev, name: editRootShelfName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingRootShelfNode(undefined);
      setEditRootShelfName("");
      setOriginalRootShelfName("");
    }
  }, [
    editingRootShelfNode,
    editRootShelfName,
    originalRootShelfName,
    setEditingRootShelfNode,
    setEditRootShelfName,
    setOriginalRootShelfName,
    expandedShelvesRef,
    updateRootShelfMutator,
  ]);

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingRootShelfNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingRootShelf();
      }
    };

    if (editingRootShelfNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    const focusInputBeforeRenameTimeout = setTimeout(() => {
      if (editingRootShelfNode && inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(focusInputBeforeRenameTimeout);
    };
  }, [editingRootShelfNode, renameEditingRootShelf]);

  const deleteRootShelf = useCallback(
    async (rootShelfNode: RootShelfNode): Promise<void> => {
      const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfNode.id);
      if (shelfTreeSummary === undefined) {
        throw new Error(`rootShelfNode not found in expandedShelves`);
      }

      const { childSubShelfNodes, materialNodes } =
        RootShelfManipulator.getAllChildSubShelfNodesAndMaterialNodes(
          rootShelfNode
        );
      const subShelfIds = childSubShelfNodes.map(val => val.id);
      const materialIds = materialNodes.map(val => val.id);

      const userAgent = navigator.userAgent;
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      await deleteRootShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          rootShelfId: rootShelfNode.id,
        },
        affected: {
          subShelfIds: subShelfIds,
          materialIds: materialIds,
        },
      });
      expandedShelvesRef.current.delete(rootShelfNode.id);
      forceUpdate();
    },
    [expandedShelvesRef, deleteRootShelfMutator, RootShelfManipulator]
  );

  return {
    rootShelfEdges:
      (data?.searchRootShelves?.searchEdges as SearchRootShelfEdge[]) || [],
    searchRootShelvesInput: searchInput,
    setSearchRootShelvesInput: setSearchInput,
    searchRootShelves: searchRootShelves,
    loadMoreRootShelves: loadMoreRootShelves,
    isFetching: loading,
    expandRootShelf: expandRootShelf,
    toggleRootShelf: toggleRootShelf,
    createRootShelf: createRootShelf,
    editRootShelfName: editRootShelfName,
    setEditRootShelfName: setEditRootShelfName,
    isNewRootShelfName: isNewRootShelfName,
    isRootShelfNodeEditing: isRootShelfNodeEditing,
    isAnyRootShelfNodeEditing: editingRootShelfNode !== undefined,
    startRenamingRootShelfNode: startRenamingRootShelfNode,
    cancelRenamingRootShelfNode: cancelRenamingRootShelfNode,
    renameEditingRootShelf: renameEditingRootShelf,
    deleteRootShelf: deleteRootShelf,
  };
};
