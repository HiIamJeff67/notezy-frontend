"use client";

import { ShelfItemContext } from "@/providers";
import { useContext } from "react";

export const useShelfItem = () => {
  const ctx = useContext(ShelfItemContext);
  if (!ctx)
    throw new Error("useShelfItem must be used within ShelfItemProvider");
  return ctx;
};
