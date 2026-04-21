"use client";

import { useContext } from "react";
import { AppRouterContext } from "@/providers/AppRouterProvider";

export const useAppRouter = () => {
  const context = useContext(AppRouterContext);
  if (!context) {
    throw new Error("useAppRouter must be used within a AppRouterProvider");
  }
  return context;
};
