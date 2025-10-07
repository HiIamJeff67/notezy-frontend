"use client";

import { useAppRouter } from "@/hooks";
import React, { createContext, useState } from "react";

interface LoadingContextType {
  isStrictLoading: boolean;
  setIsStrictLoading: (state: boolean) => void;
  startTransactionLoading: <T>(fn: () => Promise<T>) => Promise<T>;
  isAnyLoading: boolean;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useAppRouter();

  const [isStrictLoading, setIsStrictLoading] = useState<boolean>(false); // the strict loading states

  const startLoadingTransaction = async <T,>(fn: () => Promise<T>) => {
    setIsStrictLoading(true);
    try {
      return await fn();
    } finally {
      setIsStrictLoading(false);
    }
  };

  const contextValue: LoadingContextType = {
    isStrictLoading: isStrictLoading,
    setIsStrictLoading: setIsStrictLoading,
    startTransactionLoading: startLoadingTransaction,
    isAnyLoading: isStrictLoading || router.isNavigating,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
