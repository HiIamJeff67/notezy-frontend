export type LanguageKey =
  | "English"
  | "TraditionalChinese"
  | "SimpleChinese"
  | "Japanese"
  | "Korean";

export type Language = {
  key: LanguageKey;
  nativeName: string;
  code: string;
};
