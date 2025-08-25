"use client";

import { ShelfContext } from "@/providers";
import { useContext } from "react";

export const useShelf = () => {
  const ctx = useContext(ShelfContext);
  if (!ctx) throw new Error("useShelf must be used within ShelfProvider");
  return ctx;
};
