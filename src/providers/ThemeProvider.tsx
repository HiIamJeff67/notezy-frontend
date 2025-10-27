"use client";

import { useThemeStore } from "@/hooks/useThemeStore";
import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { DefaultStandardTheme } from "@shared/constants";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { Theme } from "@shared/types/theme.type";
import React, { createContext, useEffect, useState } from "react";

interface ThemeContextType {
  currentTheme: Theme;
  switchCurrentTheme: (themeId: string) => Promise<boolean>;
  availableThemes: Theme[];
  loadingThemes: Set<string>;
  addThemeFromStore: (theme: Theme) => void;
  removeThemeFromStore: (themeId: string) => void;
  isThemeLoading: (themeId: string) => boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(DefaultStandardTheme);
  const [prevTheme, setPrevTheme] = useState<Theme | null>(null);
  const themeStore = useThemeStore();

  // initialize the default theme
  useEffect(() => {
    const savedTheme = LocalStorageManipulator.getItemByKey(
      LocalStorageKeys.theme
    );
    if (!savedTheme) {
      setCurrentTheme(DefaultStandardTheme);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.theme,
        DefaultStandardTheme
      );
      return;
    }

    const isThemeExists = themeStore.availableThemes.find(
      t => t.id === savedTheme.id
    );

    if (!isThemeExists) {
      setCurrentTheme(DefaultStandardTheme);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.theme,
        DefaultStandardTheme
      );
      return;
    }

    setCurrentTheme(savedTheme);
  }, []);

  // while switch the theme, also update the DOM
  useEffect(() => {
    if (!currentTheme) return;

    LocalStorageManipulator.setItem(LocalStorageKeys.theme, currentTheme);

    if (prevTheme !== null) {
      const prevDefaultThemeCSSClassName = !prevTheme.isDark ? "light" : "dark";
      const prevThemeCSSClassName = prevTheme.isDefault
        ? prevTheme.name.split(" ")[1].toLowerCase()
        : prevTheme.id;
      document.documentElement.classList.remove(prevDefaultThemeCSSClassName);
      document.documentElement.classList.remove(prevThemeCSSClassName);
    }

    const defaultThemeCSSClassName = !currentTheme.isDark ? "light" : "dark";
    // get the css class name, and make sure we convert it to correct name if the theme is a default theme
    // do this conversion here to not disturb other lower logics
    const themeCSSClassName = currentTheme.isDefault
      ? currentTheme.name.split(" ")[1].toLowerCase()
      : currentTheme.id;
    document.documentElement.classList.add(defaultThemeCSSClassName);
    document.documentElement.classList.add(themeCSSClassName);

    setPrevTheme(currentTheme);
  }, [currentTheme]); // not sure prevTheme should be added or not

  const switchCurrentTheme = async (themeId: string): Promise<boolean> => {
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
    switchCurrentTheme: switchCurrentTheme,
    availableThemes: themeStore.availableThemes,
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
