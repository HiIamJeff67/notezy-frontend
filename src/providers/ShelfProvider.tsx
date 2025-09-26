import {
  PrivateRootShelf,
  SearchRootShelfEdge,
  SearchRootShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@/graphql/hooks/useGraphQLShelves";
import { useGetAllMyMaterialsByParentSubShelfId } from "@shared/api/hooks/material.hook";
import {
  useCreateRootShelf,
  useDeleteMyRootShelfById,
  useRestoreMyRootShelfById,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import {
  useCreateSubShelfByRootShelfId,
  useDeleteMySubShelfById,
  useGetAllMySubShelvesByRootShelfId,
  useRestoreMySubShelfById,
  useUpdateMySubShelfById,
} from "@shared/api/hooks/subShelf.hook";
import { GetAllMyMaterialsByParentSubShelfIdResponse } from "@shared/api/interfaces/material.interface";
import { GetAllMySubShelvesByRootShelfIdResponse } from "@shared/api/interfaces/subShelf.interface";
import {
  MaxMaterialsOfRootShelf,
  MaxSearchLimit,
  MaxSubShelvesOfRootShelf,
  MaxTriggerValue,
} from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import {
  AnalysisStatus,
  ShelfMaterialManipulator,
  ShelfTreeSummary,
} from "@shared/lib/shelfMaterialManipulator";
import { RootShelfNode, SubShelfNode } from "@shared/lib/shelfMaterialNodes";
import { UUID } from "crypto";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

interface ShelfContextType {
  rootShelfEdges: SearchRootShelfEdge[];
  searchRootShelves: () => Promise<void>;
  loadMoreRootShelves: () => Promise<void>;
  isFetching: boolean;
  expandedShelves: LRUCache<string, ShelfTreeSummary | null>;
  searchInput: { query: string; after: string | null };
  setSearchInput: (input: { query: string; after: string | null }) => void;
}

export const ShelfContext = createContext<ShelfContextType | undefined>(
  undefined
);

export const ShelfProvider = ({ children }: { children: React.ReactNode }) => {
  const getAllMySubShelvesQuerier = useGetAllMySubShelvesByRootShelfId();
  const getAllMyMaterialsBySubShelfQuerier =
    useGetAllMyMaterialsByParentSubShelfId();
  const createRootShelfMutator = useCreateRootShelf();
  const createSubShelfMutator = useCreateSubShelfByRootShelfId();
  const updateRootShelfMutator = useUpdateMyRootShelfById();
  const updateSubShelfMutator = useUpdateMySubShelfById();
  const restoreRootShelfMutator = useRestoreMyRootShelfById();
  const restoreSubShelfMutator = useRestoreMySubShelfById();
  const deleteRootShelfMutator = useDeleteMyRootShelfById();
  const deleteSubShelfMutator = useDeleteMySubShelfById();

  const [_, setUpdateTrigger] = useState(0);
  const [searchInput, setSearchInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });
  const expandedShelvesRef = useRef(
    new LRUCache<string, ShelfTreeSummary | null>(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf
    )
  );
  const deletedShelvesRef = useRef(
    new LRUCache<string, ShelfTreeSummary | null>(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf
    )
  );

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);

  const [executeSearch, { data, loading, error, fetchMore }] =
    useSearchRootShelvesLazyQuery();

  useEffect(() => {
    if (
      data !== undefined &&
      data.searchRootShelves !== undefined &&
      data.searchRootShelves.searchEdges !== undefined
    ) {
      for (const edge of data.searchRootShelves
        .searchEdges as SearchRootShelfEdge[]) {
        if (expandedShelvesRef.current.get(edge.node.id) === undefined) {
          expandedShelvesRef.current.set(edge.node.id, null);
        }
      }
      forceUpdate();
    }
  }, [data]);

  const searchRootShelves = useCallback(async () => {
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

  const loadMoreRootShelves = useCallback(async () => {
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

  const expandRootShelf = async (rootShelf: PrivateRootShelf) => {
    if (expandedShelvesRef.current.get(rootShelf.id) === undefined) {
      throw new Error(`root shelf does not exist`);
    }
    if (expandedShelvesRef.current.get(rootShelf.id) !== null) return;

    const userAgent = navigator.userAgent;
    const responseOfGetAllSubShelves =
      (await getAllMySubShelvesQuerier.queryAsync({
        header: {
          userAgent: userAgent,
        },
        param: {
          rootShelfId: rootShelf.id,
        },
      })) as GetAllMySubShelvesByRootShelfIdResponse;

    const rootShelfNode =
      ShelfMaterialManipulator.initializeSubShelfNodeTreeByResponse(
        {
          id: rootShelf.id,
          name: rootShelf.name,
          totalShelfNodes: rootShelf.totalShelfNodes,
          totalMaterials: rootShelf.totalMaterials,
          lastAnalyzedAt: rootShelf.lastAnalyzedAt,
          deletedAt: rootShelf.deletedAt ?? null,
          updatedAt: rootShelf.updatedAt,
          createdAt: rootShelf.createdAt,
          children: {},
        },
        responseOfGetAllSubShelves
      );
    const shelfTreeSummary: ShelfTreeSummary = {
      root: rootShelfNode,
      estimatedByteSize: 0, // may use some field to store the size of rootShelf,
      hasChanged: false,
      analysisStatus: AnalysisStatus.Unexplored,
      maxWidth: 0,
      maxDepth: 0,
      uniqueMaterialIds: [],
    };
    expandedShelvesRef.current.set(rootShelf.id, shelfTreeSummary);
    forceUpdate();
  };

  const expandSubShelf = async (parentSubShelfNode: SubShelfNode) => {
    const userAgent = navigator.userAgent;
    const responseOfGetAllMaterials =
      (await getAllMyMaterialsBySubShelfQuerier.queryAsync({
        header: {
          userAgent: userAgent,
        },
        param: {
          parentSubShelfId: parentSubShelfNode.id,
        },
      })) as GetAllMyMaterialsByParentSubShelfIdResponse;

    ShelfMaterialManipulator.initializeMaterialNodesByResponse(
      parentSubShelfNode,
      responseOfGetAllMaterials
    );
  };

  const createRootShelf = async (name: string) => {
    const userAgent = navigator.userAgent;
    const responseOfCreateRootShelf = await createRootShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
      },
      body: {
        name: name,
      },
    });

    const shelfTreeSummary: ShelfTreeSummary =
      ShelfMaterialManipulator.analysisAndGenerateSummary({
        id: responseOfCreateRootShelf.data.id as UUID,
        name: name,
        totalShelfNodes: 0,
        totalMaterials: 0,
        lastAnalyzedAt: responseOfCreateRootShelf.data.lastAnalyzedAt,
        deletedAt: null,
        updatedAt: responseOfCreateRootShelf.data.createdAt,
        createdAt: responseOfCreateRootShelf.data.createdAt,
        children: {},
      });
    expandedShelvesRef.current.set(
      responseOfCreateRootShelf.data.id as UUID,
      shelfTreeSummary
    );
  };

  const createSubShelf = async (
    rootShelfId: UUID,
    prevSubShelfNode: SubShelfNode,
    name: string
  ) => {
    const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
    if (shelfTreeSummary === undefined || shelfTreeSummary === null) {
      throw new Error(
        `parentShelfNode not found in one of the children of rootShelfNode`
      );
    }

    const userAgent = navigator.userAgent;
    const responseOfCreateSubShelf = await createSubShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
      },
      body: {
        rootShelfId: rootShelfId,
        prevSubShelfId: prevSubShelfNode.id,
        name: name,
      },
      affected: {
        rootShelfId: rootShelfId,
        prevSubShelfId: prevSubShelfNode.id,
      },
    });

    shelfTreeSummary.hasChanged = true;
    shelfTreeSummary.root.totalShelfNodes++;
    shelfTreeSummary.maxDepth = Math.max(
      shelfTreeSummary.maxDepth,
      prevSubShelfNode.path.length + 1
    );
    shelfTreeSummary.maxWidth = Math.max(
      shelfTreeSummary.maxWidth,
      Object.entries(prevSubShelfNode.children).length + 1
    );
    const newPath = prevSubShelfNode.path;
    newPath.push(prevSubShelfNode.id);
    prevSubShelfNode.children[responseOfCreateSubShelf.data.id as UUID] = {
      id: responseOfCreateSubShelf.data.id as UUID,
      rootShelfId: rootShelfId,
      prevSubShelfId: prevSubShelfNode.id as UUID,
      name: name,
      path: newPath,
      deletedAt: null,
      updatedAt: responseOfCreateSubShelf.data.createdAt,
      createdAt: responseOfCreateSubShelf.data.createdAt,
      children: {},
      materialNodes: {},
    };
  };

  const renameRootShelf = async (
    rootShelfNode: RootShelfNode,
    name: string
  ) => {
    const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfNode.id);
    if (shelfTreeSummary === undefined || shelfTreeSummary === null) {
      throw new Error(
        `parentShelfNode not found in one of the children of rootShelfNode`
      );
    }

    const userAgent = navigator.userAgent;
    await updateRootShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
      },
      body: {
        rootShelfId: rootShelfNode.id,
        values: {
          name: name,
        },
      },
    });

    // TODO: make a general method(function) to put the updated data in partial update fields to the local variable
    shelfTreeSummary.root.name = name;
  };

  const renameSubShelf = async (subShelfNode: SubShelfNode, name: string) => {
    const shelfTreeSummary = expandedShelvesRef.current.get(
      subShelfNode.rootShelfId
    );
    if (shelfTreeSummary === undefined || shelfTreeSummary === null) {
      throw new Error(
        `parentShelfNode not found in one of the children of rootShelfNode`
      );
    }

    const userAgent = navigator.userAgent;
    await updateSubShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
      },
      body: {
        subShelfId: subShelfNode.id,
        values: {
          name: name,
        },
      },
      affected: {
        rootShelfId: subShelfNode.rootShelfId,
        prevSubShelfId: subShelfNode.prevSubShelfId,
      },
    });

    subShelfNode.name = name;
  };

  const restoreRootShelf = async (rootShelfNode: RootShelfNode) => {};

  const restoreSubShelf = async (subShelfNode: SubShelfNode) => {};

  const deleteRootShelf = async (rootShelfNode: RootShelfNode) => {};

  const deleteSubShelf = async (subShelfNode: SubShelfNode) => {};

  const moveSubShelf = async () => {};

  const contextValue: ShelfContextType = {
    rootShelfEdges:
      (data?.searchRootShelves?.searchEdges as SearchRootShelfEdge[]) || [],
    searchRootShelves: searchRootShelves,
    loadMoreRootShelves: loadMoreRootShelves,
    isFetching: loading,
    expandedShelves: expandedShelvesRef.current,
    searchInput: searchInput,
    setSearchInput: setSearchInput,
  };

  return <ShelfContext value={contextValue}>{children}</ShelfContext>;
};
