import {
  PrivateRootShelf,
  SearchRootShelfEdge,
  SearchRootShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@/graphql/hooks/useGraphQLShelves";
import { getAuthorization } from "@/util/getAuthorization";
import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import {
  useCreateRootShelf,
  useDeleteMyRootShelfById,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import { useGetAllMySubShelvesByRootShelfId } from "@shared/api/hooks/subShelf.hook";
import { GetAllMySubShelvesByRootShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import { MaxSearchLimit } from "@shared/constants";
import { AnalysisStatus } from "@shared/enums";
import { LRUCache } from "@shared/lib/LRUCache";
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import { RefObject, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const getAllMySubShelvesQuerier = useGetAllMySubShelvesByRootShelfId();
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
  const [editRootShelfNodeName, setEditRootShelfNodeName] =
    useState<string>("");
  const [originalRootShelfNodeName, setOriginalRootShelfNodeName] =
    useState<string>("");

  const [executeSearch, { data, loading, fetchMore }] =
    useSearchRootShelvesLazyQuery();

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
        setEditingRootShelfNode(undefined);
        setEditRootShelfNodeName("");
        setOriginalRootShelfNodeName("");
      }
    };

    if (editingRootShelfNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    setTimeout(() => {
      if (editingRootShelfNode && inputRef.current) {
        inputRef.current?.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    editingRootShelfNode,
    editRootShelfNodeName, // will be used in renameEditingRootShelf
    originalRootShelfNodeName, // will be used in renameEditingRootShelf
    setEditingRootShelfNode,
    setEditRootShelfNodeName,
    setOriginalRootShelfNodeName,
  ]);

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
              nodeType: "ROOT_SHELF",
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
    });
  }, [executeSearch, searchInput]);

  const loadMoreRootShelves = useCallback(async (): Promise<void> => {
    const searchRootShelvesConnection = data?.searchRootShelves;

    if (
      !searchRootShelvesConnection ||
      searchRootShelvesConnection.searchEdges.length === 0
    )
      return;

    const pageInfo = searchRootShelvesConnection?.searchPageInfo;
    if (!pageInfo.hasNextPage) return;

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
      LocalStorageKeys.accessToken
    );
    const responseOfGettingAllSubShelves =
      (await getAllMySubShelvesQuerier.queryAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        param: {
          rootShelfId: rootShelf.id,
        },
      })) as GetAllMySubShelvesByRootShelfIdResponse;

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
        LocalStorageKeys.accessToken
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
          nodeType: "ROOT_SHELF",
        });
      expandedShelvesRef.current.set(
        responseOfCreatingRootShelf.data.id as UUID,
        shelfTreeSummary
      );
      forceUpdate();
    },
    [createRootShelfMutator, RootShelfManipulator, expandedShelvesRef]
  );

  const isNewRootShelfNodeName = useCallback(() => {
    return (
      editRootShelfNodeName !== originalRootShelfNodeName &&
      editRootShelfNodeName.trim() !== ""
    );
  }, [editRootShelfNodeName, originalRootShelfNodeName]);

  const isRootShelfNodeEditing = useCallback(
    (rootShelfId: UUID) => {
      return !!editingRootShelfNode && editingRootShelfNode.id === rootShelfId;
    },
    [editingRootShelfNode]
  );

  const startRenamingRootShelfNode = useCallback(
    (rootShelfNode: RootShelfNode) => {
      setEditingRootShelfNode(rootShelfNode);
      setOriginalRootShelfNodeName(rootShelfNode.name);
      setEditRootShelfNodeName(rootShelfNode.name);
    },
    [
      setEditingRootShelfNode,
      setOriginalRootShelfNodeName,
      setEditRootShelfNodeName,
    ]
  );

  const cancelRenamingRootShelfNode = useCallback(() => {
    setEditingRootShelfNode(undefined);
    setOriginalRootShelfNodeName("");
    setEditRootShelfNodeName("");
  }, [
    setEditingRootShelfNode,
    setOriginalRootShelfNodeName,
    setEditRootShelfNodeName,
  ]);

  const renameEditingRootShelf = useCallback(async (): Promise<void> => {
    try {
      if (!isNewRootShelfNodeName() || !editingRootShelfNode) {
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
        LocalStorageKeys.accessToken
      );
      await updateRootShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          rootShelfId: editingRootShelfNode.id,
          values: {
            name: editRootShelfNodeName,
          },
        },
      });

      shelfTreeSummary.root.name = editRootShelfNodeName;
      editingRootShelfNode.name = editRootShelfNodeName;
      setEditingRootShelfNode(prev =>
        prev ? { ...prev, name: editRootShelfNodeName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingRootShelfNode(undefined);
      setEditRootShelfNodeName("");
      setOriginalRootShelfNodeName("");
    }
  }, [
    editingRootShelfNode,
    editRootShelfNodeName,
    originalRootShelfNodeName,
    setEditingRootShelfNode,
    setEditRootShelfNodeName,
    setOriginalRootShelfNodeName,
    expandedShelvesRef,
    updateRootShelfMutator,
  ]);

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
        LocalStorageKeys.accessToken
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
    searchRootShelvesInput: searchInput,
    setSearchRootShelvesInput: setSearchInput,
    rootShelfEdges:
      (data?.searchRootShelves?.searchEdges as SearchRootShelfEdge[]) || [],
    searchRootShelves: searchRootShelves,
    loadMoreRootShelves: loadMoreRootShelves,
    isFetching: loading,
    expandRootShelf: expandRootShelf,
    toggleRootShelf: toggleRootShelf,
    createRootShelf: createRootShelf,
    editRootShelfNodeName: editRootShelfNodeName,
    setEditRootShelfNodeName: setEditRootShelfNodeName,
    isNewRootShelfNodeName: isNewRootShelfNodeName,
    isRootShelfNodeEditing: isRootShelfNodeEditing,
    isAnyRootShelfNodeEditing: editingRootShelfNode !== undefined,
    startRenamingRootShelfNode: startRenamingRootShelfNode,
    cancelRenamingRootShelfNode: cancelRenamingRootShelfNode,
    renameEditingRootShelf: renameEditingRootShelf,
    deleteRootShelf: deleteRootShelf,
  };
};
