import { LanguageKey } from "../types/language.type";
import { TranslationWords } from "../types/translationWords.type";
import { EnglishTranslationWords } from "./english.translation";
import { JapaneseTranslationWords } from "./japanese.translation";
import { KoreanTranslationWords } from "./korean.translation";
import { SimpleChineseTranslationWords } from "./simpleChinese.translation";
import { TraditionalChineseTranslationWords } from "./traditionalChinese.translation";

export const translations: Record<LanguageKey, TranslationWords> = {
  English: EnglishTranslationWords,
  TraditionalChinese: TraditionalChineseTranslationWords,
  SimpleChinese: SimpleChineseTranslationWords,
  Japanese: JapaneseTranslationWords,
  Korean: KoreanTranslationWords,
};
