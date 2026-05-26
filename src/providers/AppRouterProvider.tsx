import {
  useLocation,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
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
  params: Record<string, string>;
  isSamePath: (a: string, b: string) => boolean;
  getCurrentPath: () => string;
  getPrevPaths: () => string[];
  push: (path: string) => void;
  forceNavigate: (path: string) => void;
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
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });

  const [isOptimisticNavigating, setIsOptimisticNavigating] =
    useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isRoutePending, _startRouteTransition] = useTransition();
  const prevPathsRef = useRef<string[]>([]);
  const refreshIdRef = useRef<number>(0);
  const isNavigating = isOptimisticNavigating || isRoutePending || isRefreshing;

  const isSamePath = useCallback((a: string, b: string): boolean => {
    if (a[0] === "/") {
      return b[0] === "/" ? a === b : a === "/" + b;
    }
    return b[0] === "/" ? "/" + a === b : a === b;
  }, []);

  const getCurrentPath = useCallback((): string => {
    const searchParamsString = Object.keys(location.search).length
      ? "?" + new URLSearchParams(location.search).toString()
      : "";
    return location.pathname + searchParamsString;
  }, [location.pathname, location.search]);

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
          navigate({ to: path.startsWith("/") ? path : `/${path}` });
        });
      }
    },
    [getCurrentPath, isSamePath, navigate]
  );

  const forceNavigate = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        setIsOptimisticNavigating(true);
        _startRouteTransition(() => {
          window.location.href = path;
        });
      }
    },
    [getCurrentPath, isSamePath]
  );

  const replace = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        setIsOptimisticNavigating(true);
        _startRouteTransition(() => {
          navigate({
            to: path.startsWith("/") ? path : `/${path}`,
            replace: true,
          });
        });
      }
    },
    [getCurrentPath, isSamePath, navigate]
  );

  const back = useCallback((steps: number = 1): void => {
    setIsOptimisticNavigating(true);
    _startRouteTransition(() => {
      while (steps-- > 0) window.history.back();
    });
  }, []);

  const forward = useCallback((steps: number = 1): void => {
    setIsOptimisticNavigating(true);
    _startRouteTransition(() => {
      while (steps-- > 0) window.history.forward();
    });
  }, []);

  const refresh = useCallback((): void => {
    const refreshId = ++refreshIdRef.current;

    setIsRefreshing(true);
    void router.invalidate({ sync: true }).finally(() => {
      if (refreshIdRef.current === refreshId) {
        setIsRefreshing(false);
      }
    });
  }, [router]);

  const contextValue: AppRouterContextType = {
    isNavigating: isNavigating,
    params: params as Record<string, string>,
    isSamePath: isSamePath,
    getCurrentPath: getCurrentPath,
    getPrevPaths: getPrevPaths,
    push: push,
    forceNavigate: forceNavigate,
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
