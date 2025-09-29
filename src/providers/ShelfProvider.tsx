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
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import {
  useCreateSubShelfByRootShelfId,
  useDeleteMySubShelfById,
  useGetAllMySubShelvesByRootShelfId,
  useMoveMySubShelf,
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
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import {
  AnalysisStatus,
  RootShelfNode,
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/lib/shelfMaterialNodes";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import { UUID } from "crypto";
import {
  createContext,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface ShelfContextType {
  rootShelfEdges: SearchRootShelfEdge[];
  searchRootShelves: () => Promise<void>;
  loadMoreRootShelves: () => Promise<void>;
  isFetching: boolean;
  expandedShelves: LRUCache<string, ShelfTreeSummary>;
  searchInput: { query: string; after: string | null };
  setSearchInput: (input: { query: string; after: string | null }) => void;
  expandRootShelf: (rootShelf: PrivateRootShelf) => Promise<ShelfTreeSummary>;
  expandSubShelf: (subShelfNode: SubShelfNode) => Promise<void>;
  createRootShelf: (name: string) => Promise<void>;
  createSubShelf: (
    rootShelfId: UUID,
    prevSubShelfNode: SubShelfNode | null,
    name: string
  ) => Promise<void>;

  inputRef: RefObject<HTMLInputElement | null>;
  editRootShelfName: string;
  setEditRootShelfName: (editRootShelfName: string) => void;
  isNewRootShelfName: () => boolean;
  isRootShelfNodeEditing: (rootShelfNode: RootShelfNode) => boolean;
  startRenamingRootShelf: (rootShelfNode: RootShelfNode) => void;
  cancelRenamingRootShelf: () => void;
  renameRootShelf: (rootShelfNode: RootShelfNode) => Promise<void>;
  editSubShelfName: string;
  setEditSubShelfName: (editSubShelfName: string) => void;
  isNewSubShelfName: () => boolean;
  isSubShelfNodeEditing: (subShelfNode: SubShelfNode) => boolean;
  startRenamingSubShelf: (subShelfNode: SubShelfNode) => void;
  cancelRenamingSubShelf: () => void;
  renameSubShelf: (subShelfNode: SubShelfNode) => Promise<void>;
  deleteRootShelf: (rootShelfNode: RootShelfNode) => Promise<void>;
  deleteSubShelf: (
    prevSubShelfNode: SubShelfNode | null,
    subShelfNode: SubShelfNode
  ) => Promise<void>;
  moveSubShelf: (
    prevSubShelfNode: SubShelfNode | null,
    sourceSubShelfNode: SubShelfNode,
    destinationRootShelfNode: RootShelfNode,
    destinationSubShelfNode: SubShelfNode | null
  ) => Promise<void>;
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
  const deleteRootShelfMutator = useDeleteMyRootShelfById();
  const deleteSubShelfMutator = useDeleteMySubShelfById();
  const moveSubShelfMutator = useMoveMySubShelf();
  // const restoreRootShelfMutator = useRestoreMyRootShelfById();
  // const restoreSubShelfMutator = useRestoreMySubShelfById();

  const [_, setUpdateTrigger] = useState(0);
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
  const [originalRootShelfName, setOriginalRootShelfName] =
    useState<string>("");
  const [editRootShelfName, setEditRootShelfName] = useState<string>("");
  const [editingSubShelfNode, setEditingSubShelfNode] = useState<
    SubShelfNode | undefined
  >(undefined);
  const [originalSubShelfName, setOriginalSubShelfName] = useState<string>("");
  const [editSubShelfName, setEditSubShelfName] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const expandedShelvesRef = useRef(
    new LRUCache<string, ShelfTreeSummary>(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf
    )
  );
  const deletedShelvesRef = useRef(
    new LRUCache<string, ShelfTreeSummary>(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf
    )
  );

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingRootShelfNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setEditingRootShelfNode(undefined);
        setEditRootShelfName("");
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
  }, [editRootShelfName]);

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingSubShelfNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setEditingSubShelfNode(undefined);
        setEditSubShelfName("");
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
  }, [editingSubShelfNode]);

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
          const shelfTreeSummary: ShelfTreeSummary = {
            root: {
              id: edge.node.id,
              name: edge.node.name,
              totalShelfNodes: edge.node.totalShelfNodes,
              totalMaterials: edge.node.totalMaterials,
              isExpanded: false,
              lastAnalyzedAt: edge.node.lastAnalyzedAt,
              updatedAt: edge.node.updatedAt,
              createdAt: edge.node.createdAt,
              children: {},
            },
            estimatedByteSize: 0, // may use some field to store the size of rootShelf,
            hasChanged: false,
            analysisStatus: AnalysisStatus.Unexplored,
            maxWidth: 0,
            maxDepth: 0,
            uniqueMaterialIds: [],
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
    const responseOfGetAllSubShelves =
      (await getAllMySubShelvesQuerier.queryAsync({
        header: {
          userAgent: userAgent,
        },
        param: {
          rootShelfId: rootShelf.id,
        },
      })) as GetAllMySubShelvesByRootShelfIdResponse;

    const newRootShelfNode =
      RootShelfManipulator.initializeSubShelfNodeTreeByResponse(
        shelfTreeSummary.root,
        responseOfGetAllSubShelves
      );
    shelfTreeSummary.root = newRootShelfNode;
    shelfTreeSummary.root.isExpanded = true;
    shelfTreeSummary.analysisStatus = AnalysisStatus.Unexplored;
    expandedShelvesRef.current.set(rootShelf.id, shelfTreeSummary);
    forceUpdate();
    return shelfTreeSummary;
  };

  const expandSubShelf = async (subShelfNode: SubShelfNode): Promise<void> => {
    const userAgent = navigator.userAgent;
    const responseOfGetAllMaterials =
      (await getAllMyMaterialsBySubShelfQuerier.queryAsync({
        header: {
          userAgent: userAgent,
        },
        param: {
          parentSubShelfId: subShelfNode.id,
        },
      })) as GetAllMyMaterialsByParentSubShelfIdResponse;

    SubShelfManipulator.initializeMaterialNodesByResponse(
      subShelfNode,
      responseOfGetAllMaterials
    );
    forceUpdate();
  };

  const createRootShelf = async (name: string): Promise<void> => {
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
      RootShelfManipulator.analysisAndGenerateSummary({
        id: responseOfCreateRootShelf.data.id as UUID,
        name: name,
        totalShelfNodes: 0,
        totalMaterials: 0,
        isExpanded: true,
        lastAnalyzedAt: responseOfCreateRootShelf.data.lastAnalyzedAt,
        updatedAt: responseOfCreateRootShelf.data.createdAt,
        createdAt: responseOfCreateRootShelf.data.createdAt,
        children: {},
      });
    expandedShelvesRef.current.set(
      responseOfCreateRootShelf.data.id as UUID,
      shelfTreeSummary
    );
    forceUpdate();
  };

  const createSubShelf = async (
    rootShelfId: UUID,
    prevSubShelfNode: SubShelfNode | null,
    name: string
  ): Promise<void> => {
    const shelfTreeSummary = expandedShelvesRef.current.get(rootShelfId);
    if (shelfTreeSummary === undefined) {
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
        prevSubShelfId: prevSubShelfNode?.id ?? null,
        name: name,
      },
      affected: {
        rootShelfId: rootShelfId,
        prevSubShelfId: prevSubShelfNode?.id ?? null,
      },
    });

    shelfTreeSummary.hasChanged = true;
    shelfTreeSummary.root.totalShelfNodes++;
    if (prevSubShelfNode !== null) {
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
        isExpanded: true,
        updatedAt: responseOfCreateSubShelf.data.createdAt,
        createdAt: responseOfCreateSubShelf.data.createdAt,
        children: {},
        materialNodes: {},
      };
    }
    forceUpdate();
  };

  /* =============== Rename Methods =============== */
  const isNewRootShelfName = useCallback(() => {
    return (
      editRootShelfName !== originalRootShelfName &&
      editRootShelfName.trim() !== ""
    );
  }, [editRootShelfName, originalRootShelfName]);
  const isRootShelfNodeEditing = useCallback(
    (rootShelfNode: RootShelfNode) => {
      return rootShelfNode === editingRootShelfNode;
    },
    [editingRootShelfNode]
  );

  const startRenamingRootShelf = useCallback(
    (rootShelfNode: RootShelfNode) => {
      setEditingRootShelfNode(rootShelfNode);
      setOriginalRootShelfName(rootShelfNode.name);
      setEditRootShelfName(rootShelfNode.name);
    },
    [setEditingRootShelfNode, setOriginalRootShelfName, setEditRootShelfName]
  );

  const cancelRenamingRootShelf = useCallback(() => {
    setEditingRootShelfNode(undefined);
    setOriginalRootShelfName("");
    setEditRootShelfName("");
  }, [setEditingRootShelfNode, setOriginalRootShelfName, setEditRootShelfName]);

  const renameRootShelf = useCallback(
    async (rootShelfNode: RootShelfNode): Promise<void> => {
      try {
        if (!isNewRootShelfName()) {
          throw new Error("the name of the given root shelf node is invalid");
        }
        const shelfTreeSummary = expandedShelvesRef.current.get(
          rootShelfNode.id
        );
        if (shelfTreeSummary === undefined) {
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
              name: editRootShelfName,
            },
          },
        });

        shelfTreeSummary.root.name = editRootShelfName;
        rootShelfNode.name = editRootShelfName;
        forceUpdate();
      } catch (error) {
        throw error;
      } finally {
        setEditingRootShelfNode(undefined);
        setEditRootShelfName("");
        setOriginalRootShelfName("");
      }
    },
    [
      editRootShelfName,
      setEditingRootShelfNode,
      setEditRootShelfName,
      setOriginalRootShelfName,
      expandedShelvesRef,
      updateRootShelfMutator,
    ]
  );

  const isNewSubShelfName = useCallback(() => {
    return (
      editSubShelfName !== originalSubShelfName &&
      editSubShelfName.trim() !== ""
    );
  }, [editSubShelfName, originalSubShelfName]);

  const isSubShelfNodeEditing = useCallback(
    (subShelfNode: SubShelfNode) => {
      return subShelfNode === editingSubShelfNode;
    },
    [editingSubShelfNode]
  );

  const startRenamingSubShelf = useCallback(
    (subShelfNode: SubShelfNode) => {
      setEditingSubShelfNode(subShelfNode);
      setOriginalSubShelfName(subShelfNode.name);
      setEditSubShelfName(subShelfNode.name);
    },
    [setEditingSubShelfNode, setOriginalSubShelfName, setEditSubShelfName]
  );

  const cancelRenamingSubShelf = useCallback(() => {
    setEditingSubShelfNode(undefined);
    setOriginalSubShelfName("");
    setEditSubShelfName("");
  }, [setEditingSubShelfNode, setOriginalSubShelfName, setEditSubShelfName]);

  const renameSubShelf = useCallback(
    async (subShelfNode: SubShelfNode): Promise<void> => {
      try {
        if (!isNewSubShelfName()) {
          throw new Error("the name of the given sub shelf node is invalid");
        }
        if (editSubShelfName === originalSubShelfName) return;

        const shelfTreeSummary = expandedShelvesRef.current.get(
          subShelfNode.rootShelfId
        );
        if (shelfTreeSummary === undefined) {
          throw new Error(
            `subShelfNode not found in one of the children of rootShelfNode`
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
              name: editSubShelfName,
            },
          },
          affected: {
            rootShelfId: subShelfNode.rootShelfId,
            prevSubShelfId: subShelfNode.prevSubShelfId,
          },
        });

        subShelfNode.name = editSubShelfName;
        forceUpdate();
      } catch (error) {
        throw error;
      } finally {
        setEditingSubShelfNode(undefined);
        setEditSubShelfName("");
        setOriginalSubShelfName("");
      }
    },
    [
      editSubShelfName,
      setEditingSubShelfNode,
      setEditSubShelfName,
      setOriginalSubShelfName,
      expandedShelvesRef,
      updateSubShelfMutator,
    ]
  );

  const deleteRootShelf = async (
    rootShelfNode: RootShelfNode
  ): Promise<void> => {
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
    await deleteRootShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
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
  };

  const deleteSubShelf = async (
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
    await deleteSubShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
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
    forceUpdate();
  };

  const moveSubShelf = async (
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
      throw new Error(`the sourceSummary does not contain sourceSubShelfNode`);
    }

    const { childSubShelfNodes } =
      SubShelfManipulator.getAllChildSubShelfNodesAndMaterialNodes(
        sourceSubShelfNode
      );
    const childSubShelfIds = childSubShelfNodes.map(val => val.id);

    const userAgent = navigator.userAgent;
    await moveSubShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
      },
      body: {
        sourceRootShelfId: sourceSubShelfNode.rootShelfId,
        sourceSubShelfId: sourceSubShelfNode.id,
        destinationRootShelfId: sourceSubShelfNode.rootShelfId,
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
    forceUpdate();
  };

  /* ============================== Methods about Garbage ============================== */

  const contextValue: ShelfContextType = {
    rootShelfEdges:
      (data?.searchRootShelves?.searchEdges as SearchRootShelfEdge[]) || [],
    searchRootShelves: searchRootShelves,
    loadMoreRootShelves: loadMoreRootShelves,
    isFetching: loading,
    expandedShelves: expandedShelvesRef.current,
    searchInput: searchInput,
    setSearchInput: setSearchInput,
    expandRootShelf: expandRootShelf,
    expandSubShelf: expandSubShelf,
    createRootShelf: createRootShelf,
    createSubShelf: createSubShelf,

    // rename shelf feature
    inputRef: inputRef,
    renameRootShelf: renameRootShelf,
    editRootShelfName: editRootShelfName,
    setEditRootShelfName: setEditRootShelfName,
    isNewRootShelfName: isNewRootShelfName,
    isRootShelfNodeEditing: isRootShelfNodeEditing,
    startRenamingRootShelf: startRenamingRootShelf,
    cancelRenamingRootShelf: cancelRenamingRootShelf,
    editSubShelfName: editSubShelfName,
    setEditSubShelfName: setEditSubShelfName,
    isNewSubShelfName: isNewSubShelfName,
    isSubShelfNodeEditing: isSubShelfNodeEditing,
    startRenamingSubShelf: startRenamingSubShelf,
    cancelRenamingSubShelf: cancelRenamingSubShelf,
    renameSubShelf: renameSubShelf,

    deleteRootShelf: deleteRootShelf,
    deleteSubShelf: deleteSubShelf,
    moveSubShelf: moveSubShelf,
  };

  return <ShelfContext value={contextValue}>{children}</ShelfContext>;
};
