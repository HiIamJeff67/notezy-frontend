import { DropdownOptionType } from "./dropdownOptionType.type";

export type LanguageKey =
  | "English"
  | "TraditionalChinese"
  | "SimpleChinese"
  | "Japanese"
  | "Korean";

export interface Language extends DropdownOptionType {
  key: LanguageKey;
  nativeName: string;
  code: string;
}
