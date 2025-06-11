"use client";

import { LoadingContext } from "@/providers/LoadingProvider";
import { useContext } from "react";

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
