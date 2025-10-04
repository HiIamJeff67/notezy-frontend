"use client";

import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

  const appRouter = {
    isNavigating: isNavigating,
    push: (path: string) => {
      // use router.push() directly, let Next.js handle the base path
      setIsNavigating(true);
      router.push(path.startsWith("/") ? path : "/" + path);
    },
    replace: (path: string) => {
      setIsNavigating(true);
      router.replace(path.startsWith("/") ? path : "/" + path);
    },
    back: (steps: number = 1) => {
      setIsNavigating(true);
      while (steps-- > 0) router.back();
    },
    forward: (steps: number = 1) => {
      setIsNavigating(true);
      while (steps-- > 0) router.forward();
    },
    refresh: () => {
      router.refresh();
    },
    params: params,
    isSamePath: (a: string, b: string) => {
      if (a.length === 0 || b.length === 0) return false;
      if (a[0] === "/") {
        return b[0] === "/" ? a === b : a === "/" + b;
      }
      return b[0] === "/" ? "/" + a === b : a === b;
    },
    currentPath:
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
    getPrevPaths: (): string[] => [...prevPathsRef.current],
  };

  return appRouter;
};
