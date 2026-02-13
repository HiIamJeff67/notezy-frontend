import {
  PrivateRootShelf,
  SearchRootShelfEdge,
} from "@/graphql/generated/graphql";
import {
  MaxMaterialsOfRootShelf,
  MaxSubShelvesOfRootShelf,
  MaxTriggerValue,
} from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { MaterialType } from "@shared/types/enums";
import { BlockPackNode, MaterialNode } from "@shared/types/itemNodes.type";
import { RootShelfNode, SubShelfNode } from "@shared/types/shelfNodes.type";
import { ShelfTreeSummary } from "@shared/types/shelfTreeSummary.type";
import { UUID } from "crypto";
import { createContext, RefObject, useCallback, useRef, useState } from "react";
import { useItemLogic } from "./ItemLogic";
import { useRootShelfLogic } from "./RootShelfLogic";
import { useSubShelfLogic } from "./SubShelfLogic";

interface ShelfItemContextType {
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

  // for items
  editItemNodeName: string;
  setEditItemNodeName: (itemName: string) => void;
  isNewItemNodeName: () => boolean;
  isAnyItemNodeEditing: boolean;
  isItemNodeEditing: (itemId: UUID) => boolean;
  startRenamingItemNode: (itemNode: MaterialNode | BlockPackNode) => void;
  cancelRenamingItemNode: () => void;
  // material
  toggleMaterial: (materialNode: MaterialNode, reset?: boolean) => void;
  createTextbookMaterial: (
    rootShelfId: UUID,
    parentSubShelfNode: SubShelfNode,
    name: string
  ) => Promise<void>;
  createNotebookMaterial: (
    rootShelfId: UUID,
    parentSubShelfNode: SubShelfNode,
    name: string
  ) => Promise<void>;
  renameEditingMaterial: (materialType: MaterialType) => Promise<void>;
  deleteMaterial: (
    parentSubShelfNode: SubShelfNode,
    materialNode: MaterialNode
  ) => Promise<void>;
  // block pack
  toggleBlockPack: (blockPackNode: BlockPackNode, reset?: boolean) => void;
  createBlockPack: (
    rootShelfId: UUID,
    parentShelfNode: SubShelfNode,
    name: string
  ) => Promise<void>;
  renameEditingBlockPack: () => Promise<void>;
  deleteBlockPack: (
    parentSubShelfNode: SubShelfNode,
    blockPackNode: BlockPackNode
  ) => Promise<void>;
}

export const ShelfItemContext = createContext<ShelfItemContextType | undefined>(
  undefined
);

export const ShelfItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [_, setUpdateTrigger] = useState(0);
  const [focusedNode, setFocusedNode] = useState<
    RootShelfNode | SubShelfNode | MaterialNode | BlockPackNode | undefined
  >(undefined);

  const inputRef = useRef<HTMLInputElement>(null);
  const expandedShelvesRef = useRef(
    new LRUCache<string, ShelfTreeSummary>(
      MaxSubShelvesOfRootShelf + MaxMaterialsOfRootShelf
    )
  );

  const forceUpdate = () => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  };

  const isFocused = useCallback(
    (id: UUID): boolean => {
      return !!focusedNode && focusedNode.id === id;
    },
    [focusedNode, setFocusedNode]
  );

  const rootShelfLogic = useRootShelfLogic({
    expandedShelvesRef,
    inputRef,
    setFocusedNode,
    forceUpdate,
  });

  const subShelfLogic = useSubShelfLogic({
    expandedShelvesRef,
    inputRef,
    setFocusedNode,
    forceUpdate,
  });

  const itemLogic = useItemLogic({
    expandedShelvesRef,
    inputRef,
    setFocusedNode,
    forceUpdate,
  });

  const contextValue: ShelfItemContextType = {
    inputRef: inputRef,
    searchInput: rootShelfLogic.searchRootShelvesInput,
    setSearchInput: rootShelfLogic.setSearchRootShelvesInput,
    expandedShelves: expandedShelvesRef.current,
    isFocused: isFocused,
    resetFocusNode: () => setFocusedNode(undefined),
    ...rootShelfLogic,
    ...subShelfLogic,
    ...itemLogic,
  };

  return <ShelfItemContext value={contextValue}>{children}</ShelfItemContext>;
};
