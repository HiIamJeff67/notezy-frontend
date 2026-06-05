import { RoutineMeta } from "@shared/types/routineMeta.type";
import { RoutineTagMeta } from "@shared/types/routineTagMeta.type";
import { RoutineTaskMeta } from "@shared/types/routineTaskMeta.type";
import { StationMeta } from "@shared/types/stationMeta.type";
import type { UUID } from "crypto";

export type RoutineLoadState = "idle" | "loading" | "syncing";

export type RoutineViewMode = "overview" | "station";

export type RoutineTimeRailScale = "day" | "week" | "month";

export interface RoutineScope {
  stationIds: UUID[];
  routineTagIds: UUID[];
  showUntaggedRoutines: boolean;
  query: string;
}

export interface RoutineTimeWindow {
  startAt: Date;
  endAt: Date;
}

export interface RoutineStationRail {
  station: StationMeta;
  routines: RoutineMeta[];
  routineRailIndexes: Record<UUID, number>;
  railCount: number;
}

export interface RoutineStatusSummary {
  totalStations: number;
  totalRoutineTags: number;
  totalRoutines: number;
  visibleRoutines: number;
  scheduledRoutines: number;
  unscheduledRoutines: number;
  overdueRoutines: number;
  activeTasks: number;
}

export interface RoutineProviderData {
  stations: StationMeta[];
  routineTags: RoutineTagMeta[];
  routineTasks: RoutineTaskMeta[];
}
