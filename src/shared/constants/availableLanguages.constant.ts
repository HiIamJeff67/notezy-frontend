import { Language, LanguageKey } from "../types/language.type";

export const LanguageKeys: LanguageKey[] = [
  "English",
  "TraditionalChinese",
  "SimpleChinese",
  "Japanese",
  "Korean",
];

// since the support languages are not large, we can just build their map here
export const LanguageKeyMap: Record<LanguageKey, Language> = {
  English: {
    id: "language-english",
    key: "English",
    name: "English",
    nativeName: "English",
    code: "en",
  },
  TraditionalChinese: {
    id: "language-traditional-chinese",
    key: "TraditionalChinese",
    name: "Traditional Chinese",
    nativeName: "繁體中文",
    code: "zh-TW",
  },
  SimpleChinese: {
    id: "language-simple-chinese",
    key: "SimpleChinese",
    name: "Simple Chinese",
    nativeName: "简体中文",
    code: "zh-CN",
  },
  Japanese: {
    id: "language-japanese",
    key: "Japanese",
    name: "Japanese",
    nativeName: "日本語",
    code: "ja",
  },
  Korean: {
    id: "language-korean",
    key: "Korean",
    name: "Korean",
    nativeName: "한국어",
    code: "ko",
  },
};

export const Languages = LanguageKeys.map(key => LanguageKeyMap[key]);
