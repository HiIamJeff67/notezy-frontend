import { Language } from "@shared/api/interfaces/enums";

export interface LanguageData {
  key: Language;
  translationKey: string;
  nativeName: string;
  code: string;
}
