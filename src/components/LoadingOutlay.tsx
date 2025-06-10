"use client";

import { useLoading } from "@/hooks";
import { useEffect } from "react";

const LoadingOverlay = () => {
  const { isLoading } = useLoading();

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

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray bg-opacity-60 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        {/* Loading Spinner */}
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>

        {/* Loading Text */}
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
