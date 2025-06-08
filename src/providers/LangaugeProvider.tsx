"use client";

import { Language } from "@/global/types/language.type";
import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext<
  [Language, React.Dispatch<React.SetStateAction<Language>>] | undefined
>(undefined);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [_, setPrevLanguage] = useState<Language>("English");
  const [language, setLanguage] = useState<Language>("English");

  useEffect(() => {
    setPrevLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={[language, setLanguage]}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
