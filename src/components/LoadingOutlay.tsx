"use client";

import { useLoading, useTheme } from "@/hooks";
import { useEffect } from "react";

const LoadingOverlay = () => {
  const { isLoading } = useLoading();
  const themeManager = useTheme();

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  if (!isLoading) return <></>;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray bg-opacity-60 backdrop-blur-sm">
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
