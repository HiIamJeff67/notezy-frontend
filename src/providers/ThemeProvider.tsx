"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Theme, getThemeClassAttribute } from "@/global/types/theme.type";

const ThemeContext = createContext<
  [Theme, React.Dispatch<React.SetStateAction<Theme>>] | undefined
>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [prevTheme, setPrevTheme] = useState<Theme>("Dark");
  const [theme, setTheme] = useState<Theme>("Dark");

  useEffect(() => {
    console.log(theme);
    document.documentElement.classList.remove(
      getThemeClassAttribute(prevTheme)
    );
    document.documentElement.classList.add(getThemeClassAttribute(theme));
    setPrevTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
