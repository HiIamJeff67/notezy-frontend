import { ScreenBreakpoint } from "@shared/types/screenBreakpoint";
import { createContext, useEffect, useState } from "react";

interface ScreenContextType {
  width: number;
  breakpoint: ScreenBreakpoint;
}

export const ScreenContext = createContext<ScreenContextType | undefined>(
  undefined
);

const getBreakpoint = (width: number): ScreenBreakpoint => {
  if (width >= 1920) return "3xl";
  if (width >= 1536) return "2xl";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "base";
};

interface ScreenProviderProps {
  children: React.ReactNode;
}

const ScreenProvider = ({ children }: ScreenProviderProps) => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const [breakpoint, setBreakpoint] = useState<ScreenBreakpoint>(
    getBreakpoint(width)
  );

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWidth(newWidth);
      setBreakpoint(getBreakpoint(newWidth));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ScreenContext.Provider value={{ width, breakpoint }}>
      {children}
    </ScreenContext.Provider>
  );
};

export default ScreenProvider;
