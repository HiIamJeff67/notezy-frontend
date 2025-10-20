import { Language } from "./language.type";
import { Theme } from "./theme.type";

export enum LocalStorageKeys {
  AccessToken = "AccessToken",
  Theme = "Theme",
  Language = "Language",
  LastVisitedAt = "LastVisitedAt",
}

export interface LocalStorageItem {
  [LocalStorageKeys.Theme]: Theme | null;
  [LocalStorageKeys.Language]: Language | null;
  [LocalStorageKeys.LastVisitedAt]: Date | null;
  [LocalStorageKeys.AccessToken]: string | null;
}
