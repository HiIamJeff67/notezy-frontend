import { Language } from "@shared/api/interfaces/enums";
import { tKey } from "@shared/translations";
import { LanguageData } from "@shared/types/languageData.type";

// since the support languages are not large, we can just build their map here
export const LanguageKeyMap: Record<Language, LanguageData> = {
  English: {
    key: Language.English,
    translationKey: tKey.languages.english,
    nativeName: "English",
    code: "en",
  },
  TraditionalChinese: {
    key: Language.TraditionalChinese,
    translationKey: tKey.languages.traditionalChinese,
    nativeName: "繁體中文",
    code: "zh-TW",
  },
  SimpleChinese: {
    key: Language.SimpleChinese,
    translationKey: tKey.languages.simpleChinese,
    nativeName: "简体中文",
    code: "zh-CN",
  },
  Japanese: {
    key: Language.Japanese,
    translationKey: tKey.languages.japanese,
    nativeName: "日本語",
    code: "ja",
  },
  Korean: {
    key: Language.Korean,
    translationKey: tKey.languages.korean,
    nativeName: "한국어",
    code: "ko",
  },
};

export const AllLanguageData = Object.values(LanguageKeyMap);
