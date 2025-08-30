"use client";

import {
  FragmentedPrivateShelfFragmentDoc,
  PrivateShelf,
  SearchShelfEdge,
  SearchShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/graphql";
import { useSearchShelvesLazyQuery } from "@/graphql/hooks/useGraphQLShelves";
import { useApolloClient } from "@apollo/client/react";

import { useCreateShelf } from "@shared/api/hooks/shelf.hook";
import { MaxSearchNumOfShelves, MaxTriggerValue } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { ShelfManipulator, ShelfSummary } from "@shared/lib/shelfManipulator";
import { Range } from "@shared/types/range.type";
import React, { createContext, useCallback, useRef, useState } from "react";

interface ShelfContextType {
  compressedShelves: SearchShelfEdge[];
  searchCompressedShelves: () => Promise<void>;
  loadMoreCompressedShelves: () => Promise<void>;
  isFetching: boolean;
  expandedShelves: LRUCache<string, ShelfSummary>;
  currentExpandedRange: Range;
  isExpanding: boolean;
  searchInput: { query: string; after: string | null };
  setSearchInput: (input: { query: string; after: string | null }) => void;
  expandShelvesForward: (amount?: number) => void;
  expandShelvesBackward: (amount?: number) => void;
  createShelf: (name: string) => Promise<void>;
  synchronizeShelves: (index: number) => Promise<void>;
}

export const ShelfContext = createContext<ShelfContextType | undefined>(
  undefined
);

export const ShelfProvider = ({
  children,
  maxNumOfExpandedShelves,
}: {
  children: React.ReactNode;
  maxNumOfExpandedShelves: number;
}) => {
  const apolloClient = useApolloClient();
  const createShelfMutator = useCreateShelf();

  const [searchInput, setSearchInput] = useState<{
    query: string;
    after: string | null;
  }>({
    query: "",
    after: null,
  });
  const [_, setUpdateTrigger] = useState(0);
  const [currentExpandedRange, setCurrentExpandedRange] = useState({
    start: -1,
    end: -1,
  });
  const [isExpanding, setIsExpanding] = useState<boolean>(false);

  const expandedShelvesRef = useRef(
    new LRUCache<string, ShelfSummary>(maxNumOfExpandedShelves)
  ); // usually set to a ratio of the size of compressed shelves

  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => (prev + 1) % MaxTriggerValue);
  }, []);
  const expandedShelvesActions = {
    setShelf: useCallback(
      (shelfId: string, shelf: ShelfSummary) => {
        expandedShelvesRef.current.set(shelfId, shelf);
        forceUpdate();
      },
      [forceUpdate, expandedShelvesRef.current]
    ),
    getShelf: useCallback(
      (shelfId: string) => {
        return expandedShelvesRef.current.get(shelfId);
      },
      [expandedShelvesRef.current]
    ),
    deleteShelf: useCallback(
      (shelfId: string) => {
        expandedShelvesRef.current.delete(shelfId);
        forceUpdate();
      },
      [forceUpdate, expandedShelvesRef.current]
    ),
    clear: useCallback(() => {
      expandedShelvesRef.current.clear();
      forceUpdate();
    }, [forceUpdate, expandedShelvesRef.current]),
  };

  const [executeSearch, { data, loading, error, fetchMore }] =
    useSearchShelvesLazyQuery();

  const searchCompressedShelves = async () => {
    await executeSearch({
      variables: {
        input: {
          ...searchInput,
          first: MaxSearchNumOfShelves,
          sortBy: SearchShelfSortBy.LastUpdate,
          sortOrder: SearchSortOrder.Desc,
        },
      },
    });
  };

  const loadMoreCompressedShelves = async () => {
    const searchShelvesConnection = data?.searchShelves;
    if (
      !searchShelvesConnection ||
      searchShelvesConnection.searchEdges.length === 0
    )
      return;
    const pageInfo = searchShelvesConnection?.searchPageInfo;
    if (!pageInfo.hasNextPage) return;

    await fetchMore({
      variables: {
        input: {
          ...searchInput,
          first: MaxSearchNumOfShelves,
          sortBy: SearchShelfSortBy.LastUpdate,
          sortOrder: SearchSortOrder.Desc,
          after: pageInfo.endEncodedSearchCursor,
        },
      },
    });
  };

  const expandShelvesForward = useCallback(
    async (amount: number = Math.floor(maxNumOfExpandedShelves / 2)) => {
      if (isExpanding) return;
      setIsExpanding(true);

      const compressedShelves = data?.searchShelves?.searchEdges;
      if (!compressedShelves) return;
      const decodedAmount = Math.min(
        amount,
        compressedShelves.length - currentExpandedRange.end - 1
      );
      if (currentExpandedRange.end >= compressedShelves.length - 1) return;

      for (let i = 1; i <= decodedAmount; i++) {
        const targetIndex = currentExpandedRange.end + i;
        const nextExpandedShelf = compressedShelves[targetIndex]
          .node as PrivateShelf;
        if (!nextExpandedShelf) return;

        try {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              try {
                const nextRoot = ShelfManipulator.decodeFromBase64(
                  nextExpandedShelf.encodedStructure
                );

                expandedShelvesActions.setShelf(nextRoot.Id, {
                  root: nextRoot,
                  encodedStructureByteSize:
                    nextExpandedShelf.encodedStructureByteSize,
                  hasChanged: false,
                  totalShelfNodes: nextExpandedShelf.totalShelfNodes,
                  totalMaterials: nextExpandedShelf.totalMaterials,
                  maxWidth: nextExpandedShelf.maxWidth,
                  maxDepth: nextExpandedShelf.maxDepth,
                  uniqueMaterialIds: [],
                });
              } catch (error) {
                console.error(
                  `Failed to decode shelf at index ${targetIndex}:`,
                  error
                );
              } finally {
                resolve();
              }
            }, 0);
          });

          await new Promise(resolve => setTimeout(resolve, 5));
        } catch (error) {
          console.error(
            `Error processing shelf at index ${targetIndex}:`,
            error
          );
        }
      }
      setCurrentExpandedRange(prev => ({
        start: prev.start + decodedAmount,
        end: prev.end + decodedAmount,
      }));
      setIsExpanding(false);
    },
    [
      data,
      isExpanding,
      currentExpandedRange,
      expandedShelvesActions,
      maxNumOfExpandedShelves,
    ]
  );

  const expandShelvesBackward = useCallback(
    async (amount: number = Math.floor(maxNumOfExpandedShelves / 2)) => {
      if (isExpanding) return;
      setIsExpanding(true);

      const compressedShelves = data?.searchShelves?.searchEdges;
      if (!compressedShelves) return;
      let remaining = Math.min(amount, currentExpandedRange.start + 1);
      if (currentExpandedRange.start <= 0) return;

      while (remaining-- > 0) {
        const targetIndex = currentExpandedRange.start - 1;
        const previousExpandedShelf = compressedShelves[targetIndex]
          .node as PrivateShelf;
        if (!previousExpandedShelf) return;

        try {
          // Non-blocking decoding
          await new Promise<void>(resolve => {
            // use setTimeout to make the frontend UI have ability to work first
            setTimeout(() => {
              try {
                const previousRoot = ShelfManipulator.decodeFromBase64(
                  previousExpandedShelf.encodedStructure
                );

                setCurrentExpandedRange(prev => ({
                  start: prev.start - 1,
                  end: prev.end - 1,
                }));

                expandedShelvesActions.setShelf(previousRoot.Id.toString(), {
                  root: previousRoot,
                  encodedStructureByteSize:
                    previousExpandedShelf.encodedStructureByteSize,
                  hasChanged: false,
                  totalShelfNodes: previousExpandedShelf.totalShelfNodes,
                  totalMaterials: previousExpandedShelf.totalMaterials,
                  maxWidth: previousExpandedShelf.maxWidth,
                  maxDepth: previousExpandedShelf.maxDepth,
                  uniqueMaterialIds: [],
                });

                console.log(
                  `✅ Decoded previous shelf at index ${targetIndex}`
                );
              } catch (error) {
                console.error(
                  `❌ Failed to decode shelf at index ${targetIndex}:`,
                  error
                );
              } finally {
                resolve();
              }
            }, 0); // set to 0 to give way the execution
          });

          // Make another tiny timeout for the frontend UI
          if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, 5));
          }
        } catch (error) {
          console.error(
            `❌ Error processing shelf at index ${targetIndex}:`,
            error
          );
        }
      }
    },
    [
      data,
      isExpanding,
      currentExpandedRange,
      expandedShelvesActions,
      maxNumOfExpandedShelves,
    ]
  );

  const createShelf = async (name: string): Promise<void> => {
    const userAgent = navigator.userAgent;
    const responseOfCreateShelf = await createShelfMutator.mutateAsync({
      header: {
        userAgent: userAgent,
      },
      body: {
        name: name,
      },
    });

    const shelfNode: PrivateShelf = {
      __typename: "PrivateShelf",
      id: responseOfCreateShelf.data.id,
      name: name,
      encodedStructure: responseOfCreateShelf.data.encodedStructure,
      encodedStructureByteSize: 36,
      totalShelfNodes: 1,
      totalMaterials: 0,
      maxWidth: 1,
      maxDepth: 1,
      lastAnalyzedAt: String(responseOfCreateShelf.data.lastAnalyzedAt),
      updatedAt: String(responseOfCreateShelf.data.createdAt),
      createdAt: String(responseOfCreateShelf.data.createdAt),
      owner: [],
    };
    apolloClient.cache.modify({
      fields: {
        searchShelves(existing) {
          if (!existing) return existing;
          const edges = existing.searchEdges || [];
          const exists = edges.some((e: any) => e.node.id === shelfNode.id);
          if (exists) return existing;
          const writtenRef = apolloClient.cache.writeFragment({
            fragment: FragmentedPrivateShelfFragmentDoc,
            fragmentName: "FragmentedPrivateShelf",
            data: shelfNode,
          });
          const newEdge = {
            __typename: "SearchShelfEdge",
            encodedSearchCursor: "",
            node: writtenRef,
          };
          return {
            ...existing,
            searchEdges: [newEdge, ...edges],
          };
        },
      },
    });

    try {
      const root = ShelfManipulator.decodeFromBase64(
        responseOfCreateShelf.data.encodedStructure
      );
      expandedShelvesActions.setShelf(responseOfCreateShelf.data.id, {
        root,
        encodedStructureByteSize: 36,
        hasChanged: false,
        totalShelfNodes: 1,
        totalMaterials: 0,
        maxWidth: 1,
        maxDepth: 1,
        uniqueMaterialIds: [],
      });
    } catch {}
  };

  const synchronizeShelves = async (index: number): Promise<void> => {};

  const contextValue: ShelfContextType = {
    // we MUST export the `data` from GraphQL Query directly
    compressedShelves:
      (data?.searchShelves?.searchEdges as SearchShelfEdge[]) || [],
    searchCompressedShelves: searchCompressedShelves,
    loadMoreCompressedShelves: loadMoreCompressedShelves,
    isFetching: loading,
    expandedShelves: expandedShelvesRef.current,
    currentExpandedRange: currentExpandedRange,
    isExpanding: isExpanding,
    searchInput: searchInput,
    setSearchInput: setSearchInput,
    expandShelvesForward: expandShelvesForward,
    expandShelvesBackward: expandShelvesBackward,
    createShelf: createShelf,
    synchronizeShelves: synchronizeShelves,
  };

  return (
    <ShelfContext.Provider value={contextValue}>
      {children}
    </ShelfContext.Provider>
  );
};
