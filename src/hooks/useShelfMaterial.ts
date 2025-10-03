"use client";

import { ShelfMaterialContext } from "@/providers";
import { useContext } from "react";

export const useShelfMaterial = () => {
  const ctx = useContext(ShelfMaterialContext);
  if (!ctx)
    throw new Error(
      "useShelfMaterial must be used within ShelfMaterialProvider"
    );
  return ctx;
};
