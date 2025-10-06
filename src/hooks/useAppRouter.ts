"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const prevPathsRef = useRef<string[]>([]);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

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
    (path: string): boolean => {
      if (!isSamePath(getCurrentPath(), path)) {
        setIsNavigating(true);
        router.push(path.startsWith("/") ? path : "/" + path);
        return true;
      }
      return false;
    },
    [isSamePath, setIsNavigating, router]
  );

  const replace = useCallback(
    (path: string): boolean => {
      if (!isSamePath(getCurrentPath(), path)) {
        setIsNavigating(true);
        router.replace(path.startsWith("/") ? path : "/" + path);
        return true;
      }
      return false;
    },
    [isSamePath, setIsNavigating, router]
  );

  const back = useCallback(
    (steps: number = 1): void => {
      setIsNavigating(true);
      while (steps-- > 0) router.back();
    },
    [setIsNavigating, router]
  );

  const forward = useCallback(
    (steps: number = 1): void => {
      setIsNavigating(true);
      while (steps-- > 0) router.forward();
    },
    [setIsNavigating, router]
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
