"use client";

import { ModalContext } from "@/providers/ModalProvider";
import { useContext } from "react";

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
