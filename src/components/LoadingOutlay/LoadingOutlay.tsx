"use client";

import { useAppRouter, useLoading, useTheme } from "@/hooks";
import { useEffect } from "react";

const LoadingOverlay = () => {
  const { isStrictLoading } = useLoading();
  const { isNavigating } = useAppRouter();
  const isAnyLoading = isStrictLoading || isNavigating;
  const themeManager = useTheme();

  useEffect(() => {
    if (isAnyLoading) {
      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.pointerEvents = "auto";
    };
  }, [isAnyLoading]);

  if (!isAnyLoading) return <></>;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray bg-opacity-60 backdrop-blur-sm cursor-wait"
      style={{ pointerEvents: "auto" }}
    >
      <div className="flex flex-col items-center justify-center">
        {/* Loading Spinner */}
        <div
          className={`
            w-16 h-16 border-4
            ${
              themeManager.currentTheme.isDark
                ? "border-white border-t-transparent"
                : "border-black border-t-transparent"
            }
            rounded-full animate-spin mb-4
          `}
        ></div>
        {/* Loading Text */}
        <p
          className={`text-lg font-medium ${
            themeManager.currentTheme.isDark ? "text-white" : "text-black"
          }`}
        >
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
