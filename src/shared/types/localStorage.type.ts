import { Language } from "@/shared/types/language.type";
import { Theme } from "@/shared/types/theme.type";

export interface StorageItem {
  theme: Theme | null; // the theme of the current user
  language: Language | null; // the language of the current user
  lastVisitedAt: Date | null;
  // userPreferences?: {
  //   sidebarCollapsed?: boolean;
  //   editorMode?: "rich" | "markdown";
  //   notifications?: boolean;
  // };
}
