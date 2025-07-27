export type LanguageKey =
  | "English"
  | "TraditionalChinese"
  | "SimpleChinese"
  | "Japanese"
  | "Korean";

export interface Language {
  key: LanguageKey;
  translationKey: string;
  nativeName: string;
  code: string;
}
