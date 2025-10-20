"use client";

import { useLocalStorage } from "@/hooks";
import { LanguageKeyMap, Languages } from "@shared/constants";
import { tKey, translations } from "@shared/translations/index";
import { Language } from "@shared/types/language.type";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { createContext, useEffect, useState } from "react";

interface LanguageContextType {
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  t: (key: string) => string;
  tError: (error: unknown) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    LanguageKeyMap["English"]
  );
  const localStorageManager = useLocalStorage();

  useEffect(() => {
    const savedLanguage = localStorageManager.getItemByKey(
      LocalStorageKeys.Language
    );
    if (savedLanguage !== null) setCurrentLanguage(savedLanguage);
  }, []);

  // update the HTML lang attribute
  useEffect(() => {
    localStorageManager.setItem(LocalStorageKeys.Language, currentLanguage);
    const langCode = currentLanguage.code;
    document.documentElement.lang = langCode;
  }, [currentLanguage]);

  // translating function
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[currentLanguage.key];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return value ?? key; // if we can't find it, then return the original one
  };

  // translating error function
  const tError = (error: unknown): string => {
    if (error instanceof Error) {
      return t(error.message ?? tKey.error.encounterUnknownError);
    } else if (typeof error === "string") {
      return t(error);
    }
    return t(tKey.error.encounterUnknownError);
  };

  const contextValue: LanguageContextType = {
    currentLanguage: currentLanguage,
    setCurrentLanguage: setCurrentLanguage,
    availableLanguages: Languages,
    t: t,
    tError: tError,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
