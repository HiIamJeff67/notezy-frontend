"use client";

import React, { createContext, useRef, useState } from "react";

interface LoadingContextType {
  isStrictLoading: boolean;
  setIsStrictLoading: (state: boolean) => void;
  isLaxLoading: boolean;
  setIsLaxLoading: (state: boolean) => void;
  startSyncTransactionLoading: <T>(fn: () => T) => T;
  startAsyncTransactionLoading: <T>(
    fn: () => Promise<T>,
    loadingTimeout?: number,
    errorTimeout?: number
  ) => Promise<T>;
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

  const startSyncTransactionLoading = <T,>(fn: () => T) => {
    _setIsStrictLoading(true);
    strictLoadingCounterRef.current++;
    try {
      return fn();
    } finally {
      strictLoadingCounterRef.current = Math.min(
        0,
        strictLoadingCounterRef.current - 1
      );
      if (strictLoadingCounterRef.current === 0) {
        _setIsStrictLoading(false);
      }
    }
  };

  const startAsyncTransactionLoading = async <T,>(
    fn: () => Promise<T>,
    loadingTimeout: number = Infinity,
    errorTimeout: number = Infinity
  ) => {
    _setIsStrictLoading(true);
    strictLoadingCounterRef.current++;

    let isLoadingActive: boolean = true;
    let loadingTimer: NodeJS.Timeout | null = null;
    let errorTimer: NodeJS.Timeout | null = null;

    const stopLoading = () => {
      if (isLoadingActive) {
        isLoadingActive = false;
        strictLoadingCounterRef.current = Math.max(
          0,
          strictLoadingCounterRef.current - 1
        );
        if (strictLoadingCounterRef.current === 0) {
          _setIsStrictLoading(false);
        }
        if (loadingTimer) clearTimeout(loadingTimeout);
        if (errorTimeout) clearTimeout(errorTimeout);
      }
    };

    if (loadingTimeout !== Infinity) {
      loadingTimer = setTimeout(() => {
        if (isLoadingActive) {
          console.warn(
            `[LoadingProvider] Loading UI timed out after ${loadingTimeout} ms`
          );
          stopLoading();
        }
      }, loadingTimeout);
    }

    try {
      let promise = fn();

      if (errorTimeout !== Infinity) {
        promise = Promise.race([
          promise,
          new Promise<T>((_, reject) => {
            errorTimer = setTimeout(() => {
              reject(
                new Error(`Transaction hard timed out after ${errorTimeout}ms`)
              );
            }, errorTimeout);
          }),
        ]);
      }

      const result = await promise;

      // resolve the loading states first before heavy response or result
      // from the async function being returned
      stopLoading();

      return result;
    } catch (error) {
      throw error;
    } finally {
      stopLoading();
    }
  };

  const contextValue: LoadingContextType = {
    isStrictLoading: isStrictLoading,
    setIsStrictLoading: setIsStrictLoading,
    isLaxLoading: isLaxLoading,
    setIsLaxLoading: setIsLaxLoading,
    startSyncTransactionLoading: startSyncTransactionLoading,
    startAsyncTransactionLoading: startAsyncTransactionLoading,
    isAnyLoading: isStrictLoading || isLaxLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
