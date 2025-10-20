import { LocalStorageItem } from "../types/localStorage.type";
import { LanguageKeyMap } from "./availableLanguages.constant";
import { DefaultStandardTheme } from "./defaultThemes.constant";

export const LocalStoragePrefix = "notezy_";

export const DefaultLocalStorageItem: LocalStorageItem = {
  theme: DefaultStandardTheme,
  language: LanguageKeyMap["English"],
  lastVisitedAt: new Date(),
};
