import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { EnglishCommonTranslation } from "./locales/common.en";
import { JapaneseCommonTranslation } from "./locales/common.ja";
import { KoreanCommonTranslation } from "./locales/common.ko";
import { SimpleChineseCommonTranslation } from "./locales/common.zh-CN";
import { TraditionalChineseCommonTranslation } from "./locales/common.zh-TW";
import { EnglishSettingsTranslation } from "./locales/settings.en";
import { JapaneseSettingsTranslation } from "./locales/settings.ja";
import { KoreanSettingsTranslation } from "./locales/settings.ko";
import { SimpleChineseSettingsTranslation } from "./locales/settings.zh-CN";
import { TraditionalChineseSettingsTranslation } from "./locales/settings.zh-TW";
import { EnglishWorkspaceTranslation } from "./locales/workspace.en";
import { JapaneseWorkspaceTranslation } from "./locales/workspace.ja";
import { KoreanWorkspaceTranslation } from "./locales/workspace.ko";
import { SimpleChineseWorkspaceTranslation } from "./locales/workspace.zh-CN";
import { TraditionalChineseWorkspaceTranslation } from "./locales/workspace.zh-TW";

export const supportedLanguages = ["en", "zh-TW", "zh-CN", "ja", "ko"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const resources = {
  en: {
    translation: {
      ...EnglishCommonTranslation,
      ...EnglishSettingsTranslation,
      workspace: EnglishWorkspaceTranslation,
    },
  },
  "zh-TW": {
    translation: {
      ...TraditionalChineseCommonTranslation,
      ...TraditionalChineseSettingsTranslation,
      workspace: TraditionalChineseWorkspaceTranslation,
    },
  },
  "zh-CN": {
    translation: {
      ...SimpleChineseCommonTranslation,
      ...SimpleChineseSettingsTranslation,
      workspace: SimpleChineseWorkspaceTranslation,
    },
  },
  ja: {
    translation: {
      ...JapaneseCommonTranslation,
      ...JapaneseSettingsTranslation,
      workspace: JapaneseWorkspaceTranslation,
    },
  },
  ko: {
    translation: {
      ...KoreanCommonTranslation,
      ...KoreanSettingsTranslation,
      workspace: KoreanWorkspaceTranslation,
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: supportedLanguages,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const isSupportedLanguage = (value: unknown): value is SupportedLanguage =>
  typeof value === "string" &&
  supportedLanguages.includes(value as SupportedLanguage);

export const syncStoredLanguage = () => {
  const storedLanguage = LocalStorageManipulator.getItemByKey(
    LocalStorageKey.language
  );
  const code =
    typeof storedLanguage === "string"
      ? storedLanguage
      : (storedLanguage as { code?: unknown } | null)?.code;

  if (isSupportedLanguage(code)) {
    void i18n.changeLanguage(code);
  }
};

if (typeof window !== "undefined") {
  i18n.on("languageChanged", language => {
    if (!isSupportedLanguage(language)) return;

    document.documentElement.lang = language;
    LocalStorageManipulator.setItem(LocalStorageKey.language, language);
  });
}

export default i18n;
