import { StorageItem } from "../types/localStorage.type";
import { LanguageKeyMap } from "./availableLanguages.constant";
import { DefaultDarkTheme } from "./defaultThemes.constant";

export const LocalStoragePrefix = "notezy_";

export const DefaultStorageItem: StorageItem = {
  theme: DefaultDarkTheme,
  language: LanguageKeyMap["English"],
  lastVisitedAt: new Date(),
};
