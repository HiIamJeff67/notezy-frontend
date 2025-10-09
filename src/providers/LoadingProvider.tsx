"use client";

import React, { createContext, useState } from "react";

interface LoadingContextType {
  isStrictLoading: boolean;
  setIsStrictLoading: (state: boolean) => void;
  isLaxLoading: boolean;
  setIsLaxLoading: (state: boolean) => void;
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
  const [isStrictLoading, setIsStrictLoading] = useState<boolean>(false); // the strict loading states
  const [isLaxLoading, setIsLaxLoading] = useState<boolean>(false);

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
    isLaxLoading: isLaxLoading,
    setIsLaxLoading: setIsLaxLoading,
    startTransactionLoading: startLoadingTransaction,
    isAnyLoading: isStrictLoading || isLaxLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
