import { RoutinePeriod, RoutineStatus } from "@shared/api/interfaces/enums";
import { UUID } from "crypto";
import { RoutineTaskMeta } from "./routineTaskMeta.type";

export interface RoutineMeta {
  id: UUID;
  stationId: UUID;
  title: string;
  description: string;
  status: RoutineStatus;
  isPinned: boolean;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  period: RoutinePeriod | null;
  timezone: string;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  routineTagIds: UUID[]; // the routine tag has a many to many relationship to the routine
  routineTasks: RoutineTaskMeta[];
}

export const getDefaultRoutineMeta = (
  routineId: UUID,
  stationId: UUID
): RoutineMeta => ({
  id: routineId,
  stationId: stationId,
  title: "Untitled",
  description: "",
  status: RoutineStatus.Scheduled,
  isPinned: false,
  scheduledStartAt: new Date(),
  scheduledEndAt: new Date(),
  period: null,
  timezone: "",
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  routineTagIds: [],
  routineTasks: [],
});
