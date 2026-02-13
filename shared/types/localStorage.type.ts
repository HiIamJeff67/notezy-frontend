import { Language } from "./language.type";
import { Theme } from "./theme.type";

export enum LocalStorageKeys {
  accessToken = "access_token",
  theme = "theme",
  language = "language",
  lastVisitedAt = "last_visited_at",
  sidebarWidth = "sidebar_width",
}

export interface LocalStorageItem {
  [LocalStorageKeys.theme]: Theme | null;
  [LocalStorageKeys.language]: Language | null;
  [LocalStorageKeys.lastVisitedAt]: Date | null;
  [LocalStorageKeys.accessToken]: string | null;
  [LocalStorageKeys.sidebarWidth]: string | null;
}
