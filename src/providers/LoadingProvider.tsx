"use client";

import React, { createContext, useCallback, useMemo, useReducer } from "react";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  strictLoadingStates: Record<string, boolean>;
  laxLoadingStates: Record<string, boolean>;
  registerStrictLoadingState: (key: string, isLoading: boolean) => void;
  registerLaxLoadingState: (key: string, isLoading: boolean) => void;
  unregisterLoadingState: (key: string) => void;
  clearInactiveStrictLoadingStates: () => void;
  clearInactiveLaxLoadingStates: () => void;
  clearAllStrictLoadingStates: () => void;
  clearAllLaxLoadingStates: () => void;
  isAnyStrictLoading: boolean;
  isAnyLaxLoading: boolean;
  isAnyLoading: boolean;
}

interface LoadingState {
  isLoading: boolean;
  strictLoadingStates: Record<string, boolean>;
  laxLoadingStates: Record<string, boolean>;
}

type LoadingAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "REGISTER_STRICT_STATE";
      payload: { key: string; isLoading: boolean };
    }
  | { type: "REGISTER_LAX_STATE"; payload: { key: string; isLoading: boolean } }
  | { type: "UNREGISTER_STATE"; payload: string }
  | { type: "CLEAR_INACTIVE_STRICT_STATES" }
  | { type: "CLEAR_INACTIVE_LAX_STATES" }
  | { type: "CLEAR_ALL_STRICT_STATES" }
  | { type: "CLEAR_ALL_LAX_STATES" }
  | { type: "UNREGISTER_ALL_STATES" };

function loadingReducer(
  state: LoadingState,
  action: LoadingAction
): LoadingState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "REGISTER_STRICT_STATE":
      const { key: strictKey, isLoading: strictLoading } = action.payload;
      if (state.strictLoadingStates[strictKey] === strictLoading) return state;
      return {
        ...state,
        strictLoadingStates: {
          ...state.strictLoadingStates,
          [strictKey]: strictLoading,
        },
      };

    case "REGISTER_LAX_STATE":
      const { key: laxKey, isLoading: laxLoading } = action.payload;
      if (state.laxLoadingStates[laxKey] === laxLoading) return state;
      return {
        ...state,
        laxLoadingStates: { ...state.laxLoadingStates, [laxKey]: laxLoading },
      };

    case "UNREGISTER_STATE":
      const newStrictStates = { ...state.strictLoadingStates };
      const newLaxStates = { ...state.laxLoadingStates };
      delete newStrictStates[action.payload];
      delete newLaxStates[action.payload];
      return {
        ...state,
        strictLoadingStates: newStrictStates,
        laxLoadingStates: newLaxStates,
      };

    case "CLEAR_INACTIVE_STRICT_STATES":
      return {
        ...state,
        strictLoadingStates: Object.fromEntries(
          Object.entries(state.strictLoadingStates).filter(
            ([_, isLoading]) => isLoading
          )
        ),
      };

    case "CLEAR_INACTIVE_LAX_STATES":
      return {
        ...state,
        laxLoadingStates: Object.fromEntries(
          Object.entries(state.laxLoadingStates).filter(
            ([_, isLoading]) => isLoading
          )
        ),
      };

    case "CLEAR_ALL_STRICT_STATES":
      return {
        ...state,
        strictLoadingStates: {},
      };

    case "CLEAR_ALL_LAX_STATES":
      return {
        ...state,
        laxLoadingStates: {},
      };

    default:
      return state;
  }
}

export const LoadingContext = createContext<LoadingContextType | undefined>(
  undefined
);

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(loadingReducer, {
    isLoading: false,
    strictLoadingStates: {},
    laxLoadingStates: {},
  });

  const setIsLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const registerStrictLoadingState = useCallback(
    (key: string, isLoading: boolean) => {
      dispatch({ type: "REGISTER_STRICT_STATE", payload: { key, isLoading } });
    },
    []
  );

  const registerLaxLoadingState = useCallback(
    (key: string, isLoading: boolean) => {
      dispatch({ type: "REGISTER_LAX_STATE", payload: { key, isLoading } });
    },
    []
  );

  const unregisterLoadingState = useCallback((key: string) => {
    dispatch({ type: "UNREGISTER_STATE", payload: key });
  }, []);

  const clearInactiveStrictLoadingStates = useCallback(() => {
    dispatch({ type: "CLEAR_INACTIVE_STRICT_STATES" });
  }, []);

  const clearInactiveLaxLoadingStates = useCallback(() => {
    dispatch({ type: "CLEAR_INACTIVE_LAX_STATES" });
  }, []);

  const clearAllStrictLoadingStates = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_STRICT_STATES" });
  }, []);

  const clearAllLaxLoadingStates = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_LAX_STATES" });
  }, []);

  const isAnyStrictLoading = useMemo(() => {
    return Object.values(state.strictLoadingStates).some(Boolean);
  }, [state.strictLoadingStates]);

  const isAnyLaxLoading = useMemo(() => {
    return Object.values(state.laxLoadingStates).some(Boolean);
  }, [state.laxLoadingStates]);

  const isAnyLoading = useMemo(() => {
    return state.isLoading || isAnyStrictLoading || isAnyLaxLoading;
  }, [state.isLoading, isAnyStrictLoading, isAnyLaxLoading]);

  const value = useMemo(
    () => ({
      isLoading: state.isLoading,
      setIsLoading,
      strictLoadingStates: state.strictLoadingStates,
      laxLoadingStates: state.laxLoadingStates,
      registerStrictLoadingState,
      registerLaxLoadingState,
      unregisterLoadingState,
      clearInactiveStrictLoadingStates,
      clearInactiveLaxLoadingStates,
      clearAllStrictLoadingStates,
      clearAllLaxLoadingStates,
      isAnyStrictLoading,
      isAnyLaxLoading,
      isAnyLoading,
    }),
    [
      state.isLoading,
      state.strictLoadingStates,
      state.laxLoadingStates,
      setIsLoading,
      registerStrictLoadingState,
      registerLaxLoadingState,
      unregisterLoadingState,
      clearInactiveStrictLoadingStates,
      clearInactiveLaxLoadingStates,
      clearAllStrictLoadingStates,
      clearAllLaxLoadingStates,
      isAnyStrictLoading,
      isAnyLaxLoading,
      isAnyLoading,
    ]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};
