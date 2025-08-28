"use client";

import { apolloClient } from "@/graphql/apollo-client";
import {
  FragmentedPrivateShelfFragmentDoc,
  useSearchShelvesLazyQuery,
} from "@/graphql/generated/hooks";
import {
  PrivateShelf,
  SearchShelfConnection,
  SearchShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/types";
import { useCreateShelf } from "@shared/api/hooks/shelf.hook";
import { MaxSearchNumOfShelves, MaxTriggerValue } from "@shared/constants";
import { LRUCache } from "@shared/lib/LRUCache";
import { ShelfManipulator, ShelfSummary } from "@shared/lib/shelfManipulator";
import { Range } from "@shared/types/range.type";
import React, { createContext, useCallback, useRef, useState } from "react";

interface ShelfContextType {
  getSearchShelvesConnectionFromCache: () => SearchShelfConnection;
  searchCompressedShelves: () => Promise<void>;
  loadMoreCompressedShelves: () => Promise<void>;
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
    start: 0,
    end: maxNumOfExpandedShelves,
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
      [forceUpdate]
    ),
    getShelf: useCallback((shelfId: string) => {
      return expandedShelvesRef.current.get(shelfId);
    }, []),
    deleteShelf: useCallback(
      (shelfId: string) => {
        expandedShelvesRef.current.delete(shelfId);
        forceUpdate();
      },
      [forceUpdate]
    ),
    clear: useCallback(() => {
      expandedShelvesRef.current.clear();
      forceUpdate();
    }, [forceUpdate]),
  };

  const [executeSearch, { data, loading, error, fetchMore }] =
    useSearchShelvesLazyQuery({
      notifyOnNetworkStatusChange: true,
      onCompleted: _ => {
        forceUpdate();
      },
      onError: error => {
        console.error("❌ Search error:", error);
      },
    });

  const getSearchShelvesConnectionFromCache = useCallback(() => {
    return (data?.searchShelves as SearchShelfConnection) || [];
  }, [data]);

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
    const compressedShelves = getSearchShelvesConnectionFromCache();
    if (compressedShelves.searchEdges.length === 0) return;
    const pageInfo = compressedShelves?.searchPageInfo;
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

      const compressedShelves =
        getSearchShelvesConnectionFromCache().searchEdges;
      let remaining = amount;
      while (
        remaining > 0 &&
        currentExpandedRange.end < compressedShelves.length - 1
      ) {
        const targetIndex = currentExpandedRange.end + 1;
        const nextExpandedShelf = compressedShelves[targetIndex].node;

        try {
          await new Promise<void>(resolve => {
            setTimeout(() => {
              try {
                const nextRoot = ShelfManipulator.decodeFromBase64(
                  nextExpandedShelf.encodedStructure
                );

                setCurrentExpandedRange(prev => ({
                  start: prev.start + 1,
                  end: prev.end + 1,
                }));

                expandedShelvesActions.setShelf(nextRoot.id, {
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

                console.log(`✅ Decoded next shelf at index ${targetIndex}`);
              } catch (error) {
                console.error(
                  `❌ Failed to decode shelf at index ${targetIndex}:`,
                  error
                );
              } finally {
                resolve();
              }
            }, 0);
          });

          if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, 5));
          }
        } catch (error) {
          console.error(
            `❌ Error processing shelf at index ${targetIndex}:`,
            error
          );
        } finally {
          remaining--;
        }
      }
      setIsExpanding(false);
    },
    [
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

      const compressedShelves =
        getSearchShelvesConnectionFromCache().searchEdges;
      let remaining = amount;
      while (remaining > 0 && currentExpandedRange.start > 0) {
        const targetIndex = currentExpandedRange.start - 1;
        const previousExpandedShelf = compressedShelves[targetIndex].node;

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

                expandedShelvesActions.setShelf(previousRoot.id, {
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

          remaining--;

          // Make another tiny timeout for the frontend UI
          if (remaining > 0) {
            await new Promise(resolve => setTimeout(resolve, 5));
          }
        } catch (error) {
          console.error(
            `❌ Error processing shelf at index ${targetIndex}:`,
            error
          );
          remaining--;
        }
      }
    },
    [
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
    getSearchShelvesConnectionFromCache: getSearchShelvesConnectionFromCache,
    searchCompressedShelves: searchCompressedShelves,
    loadMoreCompressedShelves: loadMoreCompressedShelves,
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
