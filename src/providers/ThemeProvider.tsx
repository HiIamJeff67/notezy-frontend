"use client";
import { Theme } from "@/global/types/theme.type";
import { useThemeStore } from "@/hooks/useThemeStore";
import React, { createContext, useEffect, useState } from "react";

type ThemeContextType = {
  currentTheme: Theme | null;
  availableThemes: Theme[];
  switchTheme: (themeId: string) => Promise<boolean>;
  loadingThemes: Set<string>;
  addThemeFromStore: (theme: Theme) => void;
  removeThemeFromStore: (themeId: string) => void;
  isThemeLoading: (themeId: string) => boolean;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [prevThemeCSSClassName, setPrevThemeCSSClassName] =
    useState<string>("");

  const themeStore = useThemeStore();

  // initialize the default theme
  useEffect(() => {
    const defaultTheme = themeStore.availableThemes.find(
      t => t.id === "ae29bb37-d4ba-4826-bf56-9074e23ea65b" // Default Dark
    );
    if (defaultTheme && !currentTheme) {
      setCurrentTheme(defaultTheme);
    }
  }, [themeStore.availableThemes, currentTheme]);

  // while switch the theme, also update the DOM
  useEffect(() => {
    if (!currentTheme) return;

    if (prevThemeCSSClassName) {
      document.documentElement.classList.remove(prevThemeCSSClassName);
    }

    // get the css class name, and make sure we convert it to correct name if the theme is a default theme
    // do this conversion here to not disturb other lower logics
    const themeCSSClassName = currentTheme.isDefault
      ? currentTheme.name.split(" ")[1].toLowerCase()
      : currentTheme.id;
    document.documentElement.classList.add(themeCSSClassName);

    setPrevThemeCSSClassName(themeCSSClassName);
  }, [currentTheme, prevThemeCSSClassName]);

  const switchTheme = async (themeId: string): Promise<boolean> => {
    const theme = themeStore.availableThemes.find(t => t.id === themeId);
    if (!theme) return false;

    // if the theme is not loaded, load it first
    if (!theme.isLoaded) {
      const loaded = await themeStore.loadTheme(themeId);
      if (!loaded) return false;
    }

    setCurrentTheme(theme);
    return true;
  };

  const contextValue: ThemeContextType = {
    currentTheme: currentTheme,
    availableThemes: themeStore.availableThemes,
    switchTheme: switchTheme,
    loadingThemes: themeStore.loadingThemes,
    addThemeFromStore: themeStore.addTheme,
    removeThemeFromStore: themeStore.removeTheme,
    isThemeLoading: themeStore.isThemeLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
