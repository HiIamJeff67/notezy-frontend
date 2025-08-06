import { useTheme } from "@/hooks";
import React from "react";

const getTheme = () =>
  typeof window !== "undefined" &&
  document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

const GridBackground = ({ children }: { children: React.ReactNode }) => {
  const themeManager = useTheme();

  return (
    <div
      className="min-h-full w-full relative overflow-hidden"
      style={{
        background: themeManager.currentTheme.isDark ? "black" : "white",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(${
              themeManager.currentTheme.isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)"
            } 1px, transparent 1px), 
            linear-gradient(90deg, ${
              themeManager.currentTheme.isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)"
            } 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: themeManager.currentTheme.isDark
            ? "linear-gradient(135deg, transparent 0%, transparent 30%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 70%, black 100%)"
            : "linear-gradient(135deg, transparent 0%, transparent 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.7) 70%, white 100%)",
        }}
      />
      {children}
    </div>
  );
};

export default GridBackground;
