import {
  PrivateRootShelf,
  SearchRootShelfEdge,
  SearchRootShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/graphql";
import { useSearchRootShelvesLazyQuery } from "@/graphql/hooks/useGraphQLShelves";
import {
  useCreateNotebookMaterial,
  useDeleteMyMaterialById,
  useGetAllMyMaterialsByParentSubShelfId,
  useUpdateMyNotebookMaterialById,
} from "@shared/api/hooks/material.hook";
import {
  useCreateRootShelf,
  useDeleteMyRootShelfById,
  useUpdateMyRootShelfById,
} from "@shared/api/hooks/rootShelf.hook";
import {
  useCreateSubShelfByRootShelfId,
  useDeleteMySubShelfById,
  useGetAllMySubShelvesByRootShelfId,
  useGetMySubShelvesByPrevSubShelfId,
  useMoveMySubShelf,
  useUpdateMySubShelfById,
} from "@shared/api/hooks/subShelf.hook";
import { GetAllMyMaterialsByParentSubShelfIdResponse } from "@shared/api/interfaces/material.interface";
import {
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
import {
  MaxMaterialsOfRootShelf,
  MaxSearchLimit,
  MaxSubShelvesOfRootShelf,
  MaxTriggerValue,
} from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { RootShelfManipulator } from "@shared/lib/rootShelfManipulator";
import { SubShelfManipulator } from "@shared/lib/subShelfManipulator";
import { AnalysisStatus, MaterialType } from "@shared/types/enums";
import {
  MaterialNode,
  RootShelfNode,
  SubShelfNode,
} from "@shared/types/shelfMaterialNodes";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import {
  createContext,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

interface ShelfMaterialContextType {
  // general
  inputRef: RefObject<HTMLInputElement | null>;
  searchInput: { query: string; after: string | null };
  setSearchInput: (input: { query: string; after: string | null }) => void;
  expandedShelves: LRUCache<string, ShelfTreeSummary>;
  isFocused: (id: UUID) => boolean;
  resetFocusNode: () => void;

  // for root shelf
  rootShelfEdges: SearchRootShelfEdge[];
  searchRootShelves: () => Promise<void>;
  loadMoreRootShelves: () => Promise<void>;
  isFetching: boolean;
  expandRootShelf: (rootShelf: PrivateRootShelf) => Promise<ShelfTreeSummary>;
  toggleRootShelf: (rootShelfNode: RootShelfNode, reset?: boolean) => void;
  createRootShelf: (name: string) => Promise<void>;
  editRootShelfNodeName: string;
  setEditRootShelfNodeName: (editRootShelfNodeName: string) => void;
  isNewRootShelfNodeName: () => boolean;
  isRootShelfNodeEditing: (rootShelfId: UUID) => boolean;
  isAnyRootShelfNodeEditing: boolean;
  startRenamingRootShelfNode: (rootShelfNode: RootShelfNode) => void;
  cancelRenamingRootShelfNode: () => void;
  renameEditingRootShelf: () => Promise<void>;
  deleteRootShelf: (rootShelfNode: RootShelfNode) => Promise<void>;

  // for sub shelf
  expandSubShelf: (
    rootShelfNode: RootShelfNode,
    subShelfNode: SubShelfNode
  ) => Promise<void>;
  toggleSubShelf: (subShelfNode: SubShelfNode, reset?: boolean) => void;
  createSubShelf: (
    rootShelfId: UUID,
    prevSubShelfNode: SubShelfNode | null,
    name: string
  ) => Promise<void>;
  editSubShelfNodeName: string;
  setEditSubShelfNodeName: (editSubShelfNodeName: string) => void;
  isNewSubShelfNodeName: () => boolean;
  isAnySubShelfNodeEditing: boolean;
  isSubShelfNodeEditing: (subShelfId: UUID) => boolean;
  startRenamingSubShelfNode: (subShelfNode: SubShelfNode) => void;
  cancelRenamingSubShelfNode: () => void;
  renameEditingSubShelf: () => Promise<void>;
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

  // for material
  toggleMaterial: (materialNode: MaterialNode, reset?: boolean) => void;
  createNotebookMaterial: (
    rootShelfId: UUID,
    parentSubShelfNode: SubShelfNode,
    name: string
  ) => Promise<void>;
  editMaterialNodeName: string;
  setEditMaterialNodeName: (materialName: string) => void;
  isNewMaterialNodeName: () => boolean;
  isAnyMaterialNodeEditing: boolean;
  isMaterialNodeEditing: (materialId: UUID) => boolean;
  startRenamingMaterialNode: (materialNode: MaterialNode) => void;
  cancelRenamingMaterialNode: () => void;
  renameEditingMaterial: () => Promise<void>;
  deleteMaterial: (
    parentSubShelfNode: SubShelfNode,
    materialNode: MaterialNode
  ) => Promise<void>;
}

export const ShelfMaterialContext = createContext<
  ShelfMaterialContextType | undefined
>(undefined);

export const ShelfMaterialProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const getAllMySubShelvesQuerier = useGetAllMySubShelvesByRootShelfId();
  const getMySubShelvesBySubShelfQuerier = useGetMySubShelvesByPrevSubShelfId();
  const createRootShelfMutator = useCreateRootShelf();
  const updateRootShelfMutator = useUpdateMyRootShelfById();
  const deleteRootShelfMutator = useDeleteMyRootShelfById();

  const getAllMyMaterialsBySubShelfQuerier =
    useGetAllMyMaterialsByParentSubShelfId();
  const createSubShelfMutator = useCreateSubShelfByRootShelfId();
  const updateSubShelfMutator = useUpdateMySubShelfById();
  const deleteSubShelfMutator = useDeleteMySubShelfById();
  const moveSubShelfMutator = useMoveMySubShelf();
  // const restoreRootShelfMutator = useRestoreMyRootShelfById();
  // const restoreSubShelfMutator = useRestoreMySubShelfById();

  const createNotebookMaterialMutator = useCreateNotebookMaterial();
  const updateNotebookMaterialMutator = useUpdateMyNotebookMaterialById();
  const deleteMaterialMutator = useDeleteMyMaterialById();

  const [_, setUpdateTrigger] = useState(0);
  const [searchInput, setSearchInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });
  const [focusedNode, setFocusedNode] = useState<
    RootShelfNode | SubShelfNode | MaterialNode | undefined
  >(undefined);
  const [editingRootShelfNode, setEditingRootShelfNode] = useState<
    RootShelfNode | undefined
  >(undefined);
  const [editRootShelfNodeName, setEditRootShelfNodeName] =
    useState<string>("");
  const [originalRootShelfNodeName, setOriginalRootShelfNodeName] =
    useState<string>("");
  const [editingSubShelfNode, setEditingSubShelfNode] = useState<
    SubShelfNode | undefined
  >(undefined);
  const [editSubShelfNodeName, setEditSubShelfNodeName] = useState<string>("");
  const [originalSubShelfNodeName, setOriginalSubShelfNodeName] =
    useState<string>("");
  const [editingMaterialNode, setEditingMaterialNode] = useState<
    MaterialNode | undefined
  >(undefined);
  const [editMaterialNodeName, setEditMaterialNodeName] = useState<string>("");
  const [originalMaterialNodeName, setOriginalMaterialNodeName] =
    useState<string>("");

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

  // trigger for listen and auto focus the input with ref of inputRef declared in the top
  useEffect(() => {
    // blur the focusing rename input if the user click other places in the screen
    const handleClickOutside = async (event: MouseEvent) => {
      if (
        editingMaterialNode &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        await renameEditingMaterial();
        setEditingMaterialNode(undefined);
        setEditMaterialNodeName("");
        setOriginalMaterialNodeName("");
      }
    };

    if (editingMaterialNode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // force to focus on the rename input after 500 ms
    setTimeout(() => {
      if (editingMaterialNode && inputRef.current) {
        inputRef.current?.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    editingMaterialNode,
    editMaterialNodeName, // will be used in renameEditingMaterial
    originalMaterialNodeName, // will be used in renameEditingMaterial
    setEditingMaterialNode,
    setEditMaterialNodeName,
    setOriginalMaterialNodeName,
  ]);

  const forceUpdate = () => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  };

  const isFocused = useCallback(
    (id: UUID): boolean => {
      return !!focusedNode && focusedNode.id === id;
    },
    [focusedNode, setFocusedNode]
  );

  /* ============================== Methods for Root Shelf ============================== */
  const [executeSearch, { data, loading, error, fetchMore }] =
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
              totalShelfNodes: edge.node.totalShelfNodes,
              totalMaterials: edge.node.totalMaterials,
              lastAnalyzedAt: edge.node.lastAnalyzedAt,
              updatedAt: edge.node.updatedAt,
              createdAt: edge.node.createdAt,
              isExpanded: false,
              children: {},
              isOpen: false,
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
      const responseOfCreateRootShelf =
        await createRootShelfMutator.mutateAsync({
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
          lastAnalyzedAt: responseOfCreateRootShelf.data.lastAnalyzedAt,
          updatedAt: responseOfCreateRootShelf.data.createdAt,
          createdAt: responseOfCreateRootShelf.data.createdAt,
          isExpanded: true,
          children: {},
          isOpen: false,
        });
      expandedShelvesRef.current.set(
        responseOfCreateRootShelf.data.id as UUID,
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
      await updateRootShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
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
    },
    [expandedShelvesRef, deleteRootShelfMutator, RootShelfManipulator]
  );

  /* ============================== Methods for Sub Shelf ============================== */

  const expandSubShelf = useCallback(
    async (
      rootShelfNode: RootShelfNode,
      subShelfNode: SubShelfNode
    ): Promise<void> => {
      // the isExpanded may be modified if the user just drag and drop something in below the `subShelfNode`
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

      const responseOfGetAllSubShelves =
        (await getMySubShelvesBySubShelfQuerier.queryAsync({
          header: {
            userAgent: userAgent,
          },
          param: {
            prevSubShelfId: subShelfNode.id,
          },
        })) as GetMySubShelvesByPrevSubShelfIdResponse;

      SubShelfManipulator.initializeSubShelfNodesByResponse(
        rootShelfNode,
        subShelfNode,
        responseOfGetAllSubShelves
      );
      subShelfNode.isExpanded = true;
      forceUpdate();
    },
    [
      getAllMyMaterialsBySubShelfQuerier,
      SubShelfManipulator,
      getMySubShelvesBySubShelfQuerier,
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
          Object.entries(prevSubShelfNode.children).length +
            Object.entries(prevSubShelfNode.materialNodes).length +
            1
        );
        const newPath = prevSubShelfNode.path;
        newPath.push(prevSubShelfNode.id);
        prevSubShelfNode.children[responseOfCreateSubShelf.data.id as UUID] = {
          id: responseOfCreateSubShelf.data.id as UUID,
          rootShelfId: rootShelfId,
          prevSubShelfId: prevSubShelfNode.id as UUID,
          name: name,
          path: newPath,
          updatedAt: responseOfCreateSubShelf.data.createdAt,
          createdAt: responseOfCreateSubShelf.data.createdAt,
          isExpanded: true,
          children: {},
          materialNodes: {},
          isOpen: false,
        };
      } else {
        shelfTreeSummary.maxDepth = Math.max(shelfTreeSummary.maxDepth, 1);
        shelfTreeSummary.maxWidth = Math.max(shelfTreeSummary.maxWidth, 1);
        shelfTreeSummary.root.children[
          responseOfCreateSubShelf.data.id as UUID
        ] = {
          id: responseOfCreateSubShelf.data.id as UUID,
          rootShelfId: rootShelfId,
          prevSubShelfId: null,
          name: name,
          path: [],
          updatedAt: responseOfCreateSubShelf.data.createdAt,
          createdAt: responseOfCreateSubShelf.data.createdAt,
          isExpanded: true,
          children: {},
          materialNodes: {},
          isOpen: false,
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
      await updateSubShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
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
      await moveSubShelfMutator.mutateAsync({
        header: {
          userAgent: userAgent,
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

  /* ============================== Methods for Material ============================== */

  const toggleMaterial = (
    materialNode: MaterialNode,
    reset: boolean = false
  ) => {
    materialNode.isOpen = reset ? false : !materialNode.isOpen;
    setFocusedNode(materialNode);
    forceUpdate();
  };

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
      const responseOfCreateMaterial =
        await createNotebookMaterialMutator.mutateAsync({
          header: {
            userAgent: userAgent,
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
      shelfTreeSummary.root.totalMaterials++;
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
          responseOfCreateMaterial.data.id as UUID
        ] = {
          id: responseOfCreateMaterial.data.id as UUID,
          parentSubShelfId: parentSubShelfNode.id,
          name: name,
          type: MaterialType.Notebook,
          downloadURL: responseOfCreateMaterial.data.downloadURL,
          updatedAt: responseOfCreateMaterial.data.createdAt,
          createdAt: responseOfCreateMaterial.data.createdAt,
          isOpen: false,
        };
        forceUpdate();
      }
    },
    [expandedShelvesRef, createNotebookMaterialMutator]
  );

  const isNewMaterialNodeName = useCallback((): boolean => {
    return (
      editMaterialNodeName !== originalMaterialNodeName &&
      editMaterialNodeName.trim() !== ""
    );
  }, [editMaterialNodeName, originalMaterialNodeName]);

  const isMaterialNodeEditing = useCallback(
    (materialId: UUID): boolean => {
      return !!editingMaterialNode && editingMaterialNode.id === materialId;
    },
    [editingMaterialNode]
  );

  const startRenamingMaterialNode = useCallback(
    (materialNode: MaterialNode): void => {
      setEditingMaterialNode(materialNode);
      setOriginalMaterialNodeName(materialNode.name);
      setEditMaterialNodeName(materialNode.name);
    },
    [
      setEditingMaterialNode,
      setOriginalMaterialNodeName,
      setEditMaterialNodeName,
    ]
  );

  const cancelRenamingMaterialNode = useCallback((): void => {
    setEditingMaterialNode(undefined);
    setOriginalMaterialNodeName("");
    setEditMaterialNodeName("");
  }, [
    setEditingMaterialNode,
    setOriginalMaterialNodeName,
    setEditMaterialNodeName,
  ]);

  const renameEditingMaterial = useCallback(async (): Promise<void> => {
    try {
      if (!isNewMaterialNodeName() || !editingMaterialNode) {
        throw new Error("the name of the given material node is invalid");
      }

      const userAgent = navigator.userAgent;
      await updateNotebookMaterialMutator.mutateAsync({
        header: {
          userAgent: userAgent,
        },
        body: {
          materialId: editingMaterialNode.id,
          values: {
            name: editMaterialNodeName,
          },
        },
        affected: {
          parentSubShelfId: editingMaterialNode.parentSubShelfId,
        },
      });

      editingMaterialNode.name = editMaterialNodeName;
      setEditingMaterialNode(prev =>
        prev ? { ...prev, name: editMaterialNodeName } : undefined
      );
      forceUpdate();
    } catch (error) {
      throw error;
    } finally {
      setEditingMaterialNode(undefined);
      setEditMaterialNodeName("");
      setOriginalMaterialNodeName("");
    }
  }, [
    editingMaterialNode,
    editMaterialNodeName,
    originalMaterialNodeName,
    setEditingMaterialNode,
    setEditMaterialNodeName,
    setOriginalMaterialNodeName,
    updateNotebookMaterialMutator,
  ]);

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
      await deleteMaterialMutator.mutateAsync({
        header: {
          userAgent: userAgent,
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

  /* ============================== Methods about Garbage ============================== */

  /* ============================== Context Values ============================== */

  const contextValue: ShelfMaterialContextType = {
    // general
    inputRef: inputRef,
    searchInput: searchInput,
    setSearchInput: setSearchInput,
    expandedShelves: expandedShelvesRef.current,
    isFocused: isFocused,
    resetFocusNode: () => setFocusedNode(undefined),

    // for root shelf
    rootShelfEdges:
      (data?.searchRootShelves?.searchEdges as SearchRootShelfEdge[]) || [],
    toggleRootShelf: toggleRootShelf,
    searchRootShelves: searchRootShelves,
    loadMoreRootShelves: loadMoreRootShelves,
    isFetching: loading,
    expandRootShelf: expandRootShelf,
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

    // for sub shelf
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

    // for material
    toggleMaterial: toggleMaterial,
    createNotebookMaterial: createNotebookMaterial,
    editMaterialNodeName: editMaterialNodeName,
    setEditMaterialNodeName: setEditMaterialNodeName,
    isNewMaterialNodeName: isNewMaterialNodeName,
    isMaterialNodeEditing: isMaterialNodeEditing,
    isAnyMaterialNodeEditing: editingMaterialNode !== undefined,
    startRenamingMaterialNode: startRenamingMaterialNode,
    cancelRenamingMaterialNode: cancelRenamingMaterialNode,
    renameEditingMaterial: renameEditingMaterial,
    deleteMaterial: deleteMaterial,
  };

  return (
    <ShelfMaterialContext value={contextValue}>{children}</ShelfMaterialContext>
  );
};
