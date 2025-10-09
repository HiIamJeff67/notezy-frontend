"use client";

import { AppRouterContext } from "@/providers/AppRouterProvider";
import { useContext } from "react";

export const useAppRouter = () => {
  const context = useContext(AppRouterContext);
  if (!context) {
    throw new Error("useAppRouter must be used within a AppRouterProvider");
  }
  return context;
};
