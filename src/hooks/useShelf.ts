"use client";

import { ShelfMaterialContext } from "@/providers";
import { useContext } from "react";

export const useShelf = () => {
  const ctx = useContext(ShelfMaterialContext);
  if (!ctx)
    throw new Error("useShelf must be used within ShelfMaterialProvider");
  return ctx;
};
