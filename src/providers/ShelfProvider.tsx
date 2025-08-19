"use client";

import { Deque } from "@/shared/lib/deque";
import { ShelfNode } from "@/shared/lib/shelfNode";
import { UUID } from "@/shared/types/uuid_v4.type";
import React, { createContext } from "react";

interface ShelfContextType {
  compressedShelves: Record<UUID, Uint8Array>;
  expandedShelves: Deque<ShelfNode>;
}

export const ShelfContext = createContext<ShelfContextType | undefined>(
  undefined
);

export const ShelfProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {};
