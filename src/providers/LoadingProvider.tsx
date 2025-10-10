"use client";

import React, { createContext, useRef, useState } from "react";

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
  const [isStrictLoading, _setIsStrictLoading] = useState<boolean>(false); // the strict loading states
  const [isLaxLoading, _setIsLaxLoading] = useState<boolean>(false);
  const strictLoadingCounterRef = useRef<number>(0);
  const laxLoadingCounterRef = useRef<number>(0);

  const setIsStrictLoading = (state: boolean) => {
    if (state) {
      _setIsStrictLoading(true);
      strictLoadingCounterRef.current++;
    } else {
      strictLoadingCounterRef.current--;
      if (strictLoadingCounterRef.current === 0) {
        _setIsStrictLoading(false);
      }
    }
  };

  const setIsLaxLoading = (state: boolean) => {
    if (state) {
      _setIsLaxLoading(true);
      laxLoadingCounterRef.current++;
    } else {
      laxLoadingCounterRef.current--;
      if (laxLoadingCounterRef.current === 0) {
        _setIsLaxLoading(false);
      }
    }
  };

  const startTransactionLoading = async <T,>(fn: () => Promise<T>) => {
    _setIsStrictLoading(true);
    strictLoadingCounterRef.current++;
    try {
      return await fn();
    } finally {
      strictLoadingCounterRef.current--;
      if (strictLoadingCounterRef.current === 0) {
        _setIsStrictLoading(false);
      }
    }
  };

  const contextValue: LoadingContextType = {
    isStrictLoading: isStrictLoading,
    setIsStrictLoading: setIsStrictLoading,
    isLaxLoading: isLaxLoading,
    setIsLaxLoading: setIsLaxLoading,
    startTransactionLoading: startTransactionLoading,
    isAnyLoading: isStrictLoading || isLaxLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
