"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const prevPathsRef = useRef<string[]>([]);

  if (
    typeof window !== "undefined" &&
    prevPathsRef.current[prevPathsRef.current.length - 1] !== pathname
  ) {
    prevPathsRef.current.push(pathname);
  }

  const appRouter = {
    push: (path: string) => {
      // use router.push() directly, let Next.js handle the base path
      router.push(path.startsWith("/") ? path : "/" + path);
    },
    replace: (path: string) => {
      router.replace(path.startsWith("/") ? path : "/" + path);
    },
    back: (steps: number = 1) => {
      while (steps-- > 0) router.back();
    },
    forward: (steps: number = 1) => {
      while (steps-- > 0) router.forward();
    },
    refresh: () => router.refresh(),
    getPrevPaths: (): string[] => [...prevPathsRef.current],
  };

  return appRouter;
};
