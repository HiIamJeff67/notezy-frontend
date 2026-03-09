"use client";

import { UserContext } from "@/providers/UserProvider";
import { useContext } from "react";

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
};
