import { LanguageData } from "@shared/types/languageData.type";
import { ThemeData } from "@shared/types/theme.type";

export enum LocalStorageKey {
  accessToken = "access_token",
  theme = "theme",
  language = "language",
  lastVisitedAt = "last_visited_at",
  sidebarWidth = "sidebar_width",
  dashboardWidgets = "dashboard_widgets",
  colors = "colors",
  timeRailsStationIndexes = "time_rails_station_indexes",
}

export interface LocalStorageItem {
  [LocalStorageKey.theme]: ThemeData | null;
  [LocalStorageKey.language]: LanguageData | null;
  [LocalStorageKey.lastVisitedAt]: Date | null;
  [LocalStorageKey.accessToken]: string | null;
  [LocalStorageKey.sidebarWidth]: string | null;
  [LocalStorageKey.dashboardWidgets]: string | null;
  [LocalStorageKey.colors]: string | null;
  [LocalStorageKey.timeRailsStationIndexes]: string[] | null;
}
