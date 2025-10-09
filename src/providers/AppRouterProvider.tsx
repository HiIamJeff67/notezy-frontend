"use client";

import { Params } from "next/dist/server/request/params";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

interface AppRouterContextType {
  isNavigating: boolean;
  params: Params;
  isSamePath: (a: string, b: string) => boolean;
  getCurrentPath: () => string;
  getPrevPaths: () => string[];
  push: (path: string) => void;
  replace: (path: string) => void;
  back: (steps?: number) => void;
  forward: (steps?: number) => void;
  refresh: () => void;
}

export const AppRouterContext = createContext<AppRouterContextType | undefined>(
  undefined
);

export const AppRouterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const [isOptimisticNavigating, setIsOptimisticNavigating] =
    useState<boolean>(false);
  const [isRoutePending, _startRouteTransition] = useTransition();
  const prevPathsRef = useRef<string[]>([]);
  const isNavigating = isOptimisticNavigating || isRoutePending;

  const isSamePath = useCallback((a: string, b: string): boolean => {
    if (a.length === 0 || b.length === 0) return false;
    if (a[0] === "/") {
      return b[0] === "/" ? a === b : a === "/" + b;
    }
    return b[0] === "/" ? "/" + a === b : a === b;
  }, []);

  const getCurrentPath = useCallback((): string => {
    return (
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
    );
  }, [pathname, searchParams]);

  const getPrevPaths = useCallback((): string[] => {
    return [...prevPathsRef.current];
  }, []);

  useEffect(() => {
    const currentPath = getCurrentPath();
    const prevPath = prevPathsRef.current[prevPathsRef.current.length - 1];

    if (currentPath !== prevPath) {
      prevPathsRef.current.push(currentPath);
      setIsOptimisticNavigating(false);
    }
  }, [getCurrentPath]);

  const push = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        setIsOptimisticNavigating(true);
        _startRouteTransition(() => {
          router.push(path.startsWith("/") ? path : "/" + path);
        });
      }
    },
    [getCurrentPath, isSamePath, router]
  );

  const replace = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        setIsOptimisticNavigating(true);
        _startRouteTransition(() => {
          router.replace(path.startsWith("/") ? path : "/" + path);
        });
      }
    },
    [getCurrentPath, isSamePath, router]
  );

  const back = useCallback(
    (steps: number = 1): void => {
      setIsOptimisticNavigating(true);
      _startRouteTransition(() => {
        while (steps-- > 0) router.back();
      });
    },
    [router]
  );

  const forward = useCallback(
    (steps: number = 1): void => {
      setIsOptimisticNavigating(true);
      _startRouteTransition(() => {
        while (steps-- > 0) router.forward();
      });
    },
    [router]
  );

  const refresh = useCallback((): void => {
    setIsOptimisticNavigating(true);
    _startRouteTransition(() => {
      router.refresh();
    });
  }, [router]);

  const contextValue: AppRouterContextType = {
    isNavigating: isNavigating,
    params: params,
    isSamePath: isSamePath,
    getCurrentPath: getCurrentPath,
    getPrevPaths: getPrevPaths,
    push: push,
    replace: replace,
    back: back,
    forward: forward,
    refresh: refresh,
  };

  return (
    <AppRouterContext.Provider value={contextValue}>
      {children}
    </AppRouterContext.Provider>
  );
};
