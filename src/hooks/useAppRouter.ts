"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useRef, useTransition } from "react";

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [isNavigating, _startTransition] = useTransition();
  const prevPathsRef = useRef<string[]>([]);

  if (
    typeof window !== "undefined" &&
    prevPathsRef.current[prevPathsRef.current.length - 1] !== pathname
  ) {
    prevPathsRef.current.push(pathname);
  }

  const isSamePath = (a: string, b: string): boolean => {
    if (a.length === 0 || b.length === 0) return false;
    if (a[0] === "/") {
      return b[0] === "/" ? a === b : a === "/" + b;
    }
    return b[0] === "/" ? "/" + a === b : a === b;
  };

  const getCurrentPath = useCallback((): string => {
    return (
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
    );
  }, [pathname, searchParams]);

  const getPrevPaths = useCallback((): string[] => {
    return [...prevPathsRef.current];
  }, [prevPathsRef]);

  const push = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        _startTransition(() => {
          router.push(path.startsWith("/") ? path : "/" + path);
        });
      }
    },
    [getCurrentPath, isSamePath, _startTransition, router]
  );

  const replace = useCallback(
    (path: string) => {
      if (!isSamePath(getCurrentPath(), path)) {
        _startTransition(() => {
          router.replace(path.startsWith("/") ? path : "/" + path);
        });
      }
    },
    [getCurrentPath, isSamePath, _startTransition, router]
  );

  const back = useCallback(
    (steps: number = 1): void => {
      _startTransition(() => {
        while (steps-- > 0) router.back();
      });
    },
    [_startTransition, router]
  );

  const forward = useCallback(
    (steps: number = 1): void => {
      _startTransition(() => {
        while (steps-- > 0) router.forward();
      });
    },
    [_startTransition, router]
  );

  const refresh = useCallback((): void => {
    router.refresh();
  }, [router]);

  const appRouter = {
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

  return appRouter;
};
