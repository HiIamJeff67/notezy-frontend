import { Language } from "./language.type";
import { Theme } from "./theme.type";

export enum LocalStorageKeys {
  accessToken = "AccessToken",
  theme = "Theme",
  language = "Language",
  lastVisitedAt = "LastVisitedAt",
  sidebarWidth = "SidebarWidth",
}

export interface LocalStorageItem {
  [LocalStorageKeys.theme]: Theme | null;
  [LocalStorageKeys.language]: Language | null;
  [LocalStorageKeys.lastVisitedAt]: Date | null;
  [LocalStorageKeys.accessToken]: string | null;
  [LocalStorageKeys.sidebarWidth]: string | null;
}
