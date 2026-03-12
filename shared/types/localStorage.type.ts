import { Language } from "./language.type";
import { Theme } from "./theme.type";

export enum LocalStorageKey {
  accessToken = "access_token",
  theme = "theme",
  language = "language",
  lastVisitedAt = "last_visited_at",
  sidebarWidth = "sidebar_width",
  dashboardWidgets = "dashboard_widgets",
}

export interface LocalStorageItem {
  [LocalStorageKey.theme]: Theme | null;
  [LocalStorageKey.language]: Language | null;
  [LocalStorageKey.lastVisitedAt]: Date | null;
  [LocalStorageKey.accessToken]: string | null;
  [LocalStorageKey.sidebarWidth]: string | null;
  [LocalStorageKey.dashboardWidgets]: string | null;
}
