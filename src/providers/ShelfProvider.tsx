"use client";

import { useSearchShelvesLazyQuery } from "@/graphql/generated/hooks";
import {
  SearchShelfEdge,
  SearchShelfInput,
  SearchShelfSortBy,
  SearchSortOrder,
} from "@/graphql/generated/types";
import { CreateShelf } from "@shared/api/functions/shelf.api";
import { Deque } from "@shared/lib/deque";
import { ShelfManipulator, ShelfSummary } from "@shared/lib/shelfManipulator";
import { Range } from "@shared/types/range.type";
import React, { createContext, useCallback, useRef, useState } from "react";

interface ShelfContextType {
  compressedShelves: SearchShelfEdge[];
  expandedShelves: Deque<ShelfSummary>;
  currentExpandedRange: Range;
  isExpanding: boolean;
  searchInput: SearchShelfInput;
  setSearchInput: (input: SearchShelfInput) => void;
  searchCompressedShelves: () => Promise<void>;
  loadMoreCompressedShelves: () => Promise<void>;
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
  const [searchInput, setSearchInput] = useState<SearchShelfInput>({
    query: "",
    first: 100,
    after: null,
    sortBy: SearchShelfSortBy.LastUpdate,
    sortOrder: SearchSortOrder.Desc,
  });
  const [compressedShelves, setCompressedShelves] = useState<SearchShelfEdge[]>(
    []
  );

  const expandedShelvesRef = useRef(
    new Deque<ShelfSummary>(maxNumOfExpandedShelves)
  ); // usually set to a ratio of the size of compressed shelves
  const [_, setUpdateTrigger] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);
  const [currentExpandedRange, setCurrentExpandedRange] = useState({
    start: 0,
    end: 100,
  });
  const [isExpanding, setIsExpanding] = useState<boolean>(false);

  const expandedShelvesActions = {
    scrollNext: useCallback(
      (element: ShelfSummary) => {
        if (expandedShelvesRef.current.isFull()) {
          expandedShelvesRef.current.shift();
        }
        expandedShelvesRef.current.push(element);
        forceUpdate();
      },
      [forceUpdate]
    ),
    scrollPrevious: useCallback(
      (element: ShelfSummary) => {
        if (expandedShelvesRef.current.isFull()) {
          expandedShelvesRef.current.pop();
        }
        expandedShelvesRef.current.unshift(element);
        forceUpdate();
      },
      [forceUpdate]
    ),
  };

  const [executeSearch, { data, loading, error, fetchMore }] =
    useSearchShelvesLazyQuery({
      notifyOnNetworkStatusChange: true,
      onCompleted: data => {
        console.log("✅ Search completed:", data);

        const newCompressedShelves: SearchShelfEdge[] = [];
        data.searchShelves.searchEdges.forEach(edge => {
          newCompressedShelves.push(edge as SearchShelfEdge);
        });

        setCompressedShelves(prevShelves => [
          ...prevShelves,
          ...newCompressedShelves,
        ]);
      },
      onError: error => {
        console.error("❌ Search error:", error);
      },
    });

  // for initial searching the shelves
  const searchCompressedShelves = async () => {
    console.log("Executing Search...");
    await executeSearch({
      variables: { input: searchInput },
    });
  };

  const loadMoreCompressedShelves = async () => {
    if (!data?.searchShelves.searchPageInfo.hasNextPage) return;

    console.log("Loading more...");
    await fetchMore({
      variables: {
        input: {
          ...searchInput,
          after: data.searchShelves.searchPageInfo.endEncodedSearchCursor,
        },
      },
    });
  };

  const expandShelvesForward = useCallback(
    async (amount: number = Math.floor(maxNumOfExpandedShelves / 2)) => {
      if (isExpanding) return;
      setIsExpanding(true);

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

                expandedShelvesActions.scrollNext({
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
      compressedShelves,
      expandedShelvesActions,
      maxNumOfExpandedShelves,
    ]
  );

  const expandShelvesBackward = useCallback(
    async (amount: number = Math.floor(maxNumOfExpandedShelves / 2)) => {
      if (isExpanding) return;
      setIsExpanding(true);

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

                expandedShelvesActions.scrollPrevious({
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
      compressedShelves,
      expandedShelvesActions,
      maxNumOfExpandedShelves,
    ]
  );

  const createShelf = async (name: string): Promise<void> => {
    const userAgent = navigator.userAgent;
    const responseOfCreateShelf = await CreateShelf({
      header: {
        userAgent: userAgent,
      },
      body: {
        name: name,
      },
    });
    // if the creation is success
    setCompressedShelves(prev => [
      {
        encodedSearchCursor: "",
        node: {
          id: "",
          name: name,
          encodedStructure: responseOfCreateShelf.data.encodedStructure,
          encodedStructureByteSize: 36,
          totalShelfNodes: 1,
          totalMaterials: 0,
          maxWidth: 1,
          maxDepth: 1,
          updatedAt: String(responseOfCreateShelf.data.createdAt),
          createdAt: String(responseOfCreateShelf.data.createdAt),
          owner: [],
        },
      },
      ...prev,
    ]);
  };

  const synchronizeShelves = async (index: number): Promise<void> => {};

  const contextValue: ShelfContextType = {
    compressedShelves: compressedShelves,
    expandedShelves: expandedShelvesRef.current,
    currentExpandedRange: currentExpandedRange,
    isExpanding: isExpanding,
    searchInput: searchInput,
    setSearchInput: setSearchInput,
    searchCompressedShelves: searchCompressedShelves,
    loadMoreCompressedShelves: loadMoreCompressedShelves,
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
