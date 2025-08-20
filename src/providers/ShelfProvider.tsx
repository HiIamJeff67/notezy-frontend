"use client";

import { Deque } from "@/shared/lib/deque";
import { ShelfManipulator, ShelfSummary } from "@/shared/lib/shelfManipulator";
import { UUID } from "@/shared/types/uuid_v4.type";
import React, { createContext, useState } from "react";

interface ShelfContextType {
  compressedShelves: Record<UUID, Uint8Array>;
  expandedShelves: Deque<ShelfSummary>;
  // loadCompressedShelves: (amount: number) => Promise<void>;
  // expandShelves: (direction: "previous" | "next", amount: number) => void;
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
  const [compressedShelves, setCompressedShelves] = useState<
    Record<UUID, Uint8Array>
  >({});
  const [expandedShelves, setExpandedShelves] = useState<Deque<ShelfSummary>>(
    new Deque(maxNumOfExpandedShelves)
  );
  const shelfManipulator = new ShelfManipulator(); // use default maxTraverseCount

  const contextValue: ShelfContextType = {
    compressedShelves: compressedShelves,
    expandedShelves: expandedShelves,
  };

  return (
    <ShelfContext.Provider value={contextValue}>
      {children}
    </ShelfContext.Provider>
  );
};
