"use client";
import { useLocalStorage } from "@/hooks";
import { useThemeStore } from "@/hooks/useThemeStore";
import { DefaultDarkTheme } from "@/shared/constants/defaultThemes.constant";
import { Theme } from "@/shared/types/theme.type";
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
  const [currentTheme, setCurrentTheme] = useState<Theme>(DefaultDarkTheme);
  const [prevThemeCSSClassName, setPrevThemeCSSClassName] =
    useState<string>("");
  const localStorageManager = useLocalStorage();

  const themeStore = useThemeStore();

  // initialize the default theme
  useEffect(() => {
    const savedTheme = localStorageManager.getItemByKey("theme");
    if (savedTheme === null) {
      setCurrentTheme(DefaultDarkTheme);
      localStorageManager.setItem("theme", DefaultDarkTheme);
      return;
    }

    const isThemeExists = themeStore.availableThemes.find(
      t => t.id === savedTheme.id
    );

    if (!isThemeExists) {
      setCurrentTheme(DefaultDarkTheme);
      localStorageManager.setItem("theme", DefaultDarkTheme);
      return;
    }

    setCurrentTheme(savedTheme);
  }, []);

  // while switch the theme, also update the DOM
  useEffect(() => {
    if (!currentTheme) return;

    localStorageManager.setItem("theme", currentTheme);

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
