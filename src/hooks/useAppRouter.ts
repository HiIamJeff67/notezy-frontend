"use client";

import { DevelopmentBaseURL } from "@/global/constants/urlRoutes.constant";
import { useRouter } from "next/navigation";

export const useAppRouter = () => {
  const router = useRouter();
  const BaseURL = DevelopmentBaseURL;
  const prevPaths: string[] = [BaseURL];
  let currentPathIndex: number = -1;

  const _getDestination = function (path: string): string {
    return path.startsWith("/") ? BaseURL + path : BaseURL + "/" + path;
  };

  const appRouter = {
    push: (path: string) => {
      const destination = _getDestination(path);
      prevPaths.push(destination);
      router.push(destination);
      currentPathIndex++;
    },

    replace: (path: string) => {
      const destination = _getDestination(path);
      prevPaths.length = 0; // clear the prevPaths
      currentPathIndex = -1; // reset the pointer of prevPaths
      router.replace(destination);
    },

    back: (steps: number = 1) => {
      if (steps <= 0) return;

      while (currentPathIndex >= 0 && steps > 0) {
        router.back();
        currentPathIndex--;
        steps--;
      }
    },

    forward: (steps: number = 1) => {
      if (steps <= 0) return;

      while (currentPathIndex < prevPaths.length - 1 && steps > 0) {
        router.forward();
        currentPathIndex++;
        steps--;
      }
    },

    refresh: () => router.refresh(),

    getPrevPaths: (): string[] => {
      return prevPaths;
    },
  };

  return appRouter;
};
