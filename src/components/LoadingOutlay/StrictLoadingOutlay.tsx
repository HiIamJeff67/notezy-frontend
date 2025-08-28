"use client";

import { useTheme } from "@/hooks";

interface StrictLoadingOutlayProps {
  condition?: boolean;
}

const StrictLoadingOutlay = ({ condition }: StrictLoadingOutlayProps) => {
  const themeManager = useTheme();

  if (condition !== undefined && condition !== null && !condition) return <></>;

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

export default StrictLoadingOutlay;
