import { tKey } from "../translations";
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
    key: "English",
    translationKey: tKey.languages.english,
    nativeName: "English",
    code: "en",
  },
  TraditionalChinese: {
    key: "TraditionalChinese",
    translationKey: tKey.languages.traditionalChinese,
    nativeName: "繁體中文",
    code: "zh-TW",
  },
  SimpleChinese: {
    key: "SimpleChinese",
    translationKey: tKey.languages.simpleChinese,
    nativeName: "简体中文",
    code: "zh-CN",
  },
  Japanese: {
    key: "Japanese",
    translationKey: tKey.languages.japanese,
    nativeName: "日本語",
    code: "ja",
  },
  Korean: {
    key: "Korean",
    translationKey: tKey.languages.korean,
    nativeName: "한국어",
    code: "ko",
  },
};

export const Languages = LanguageKeys.map(key => LanguageKeyMap[key]);
