"use client";

import {
  LanguageKeyMap,
  Languages,
} from "@/global/constants/availableLanguages.constant";
import { translations } from "@/global/translations/index";
import { Language } from "@/global/types/language.type";
import { createContext, useEffect, useState } from "react";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  availableLanguages: Language[];
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>(LanguageKeyMap["English"]);

  // update the HTML lang attribute
  useEffect(() => {
    const langCode = language.code;

    document.documentElement.lang = langCode;
  }, [language]);

  // translating function
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language.key];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    return value || key; // if we can't find it, then return the original one
  };

  const contextValue: LanguageContextType = {
    language: language,
    setLanguage: setLanguage,
    availableLanguages: Languages,
    t: t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};
