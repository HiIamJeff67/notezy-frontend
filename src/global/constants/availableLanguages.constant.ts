import { Language, LanguageKey } from "../types/language.type";

export const LanguageKeys: LanguageKey[] = [
  "English",
  "TraditionalChinese",
  "SimpleChinese",
  "Japanese",
  "Korean",
];

export const LanguageKeyMap: Record<LanguageKey, Language> = {
  English: {
    key: "English",
    nativeName: "English",
    code: "en",
  },
  TraditionalChinese: {
    key: "TraditionalChinese",
    nativeName: "繁體中文",
    code: "zh-TW",
  },
  SimpleChinese: {
    key: "SimpleChinese",
    nativeName: "简体中文",
    code: "zh-CN",
  },
  Japanese: {
    key: "Japanese",
    nativeName: "日本語",
    code: "ja",
  },
  Korean: {
    key: "Korean",
    nativeName: "한국어",
    code: "ko",
  },
};

export const Languages = LanguageKeys.map(key => LanguageKeyMap[key]);
