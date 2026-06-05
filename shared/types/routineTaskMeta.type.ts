import {
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import { UUID } from "crypto";

export interface RoutineTaskMeta {
  id: UUID;
  stationId: UUID;
  purpose: RoutineTaskPurpose;
  payload: any;
  priority: number;
  status: RoutineTaskStatus;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  actualStartedAt: Date | null;
  actualEndedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export const getDefaultRoutineTaskMeta = (
  routineTaskId: UUID,
  stationId: UUID
): RoutineTaskMeta => ({
  id: routineTaskId,
  stationId: stationId,
  purpose: RoutineTaskPurpose.CreateBlock,
  payload: {},
  priority: 0,
  status: RoutineTaskStatus.Idle,
  attempts: 0,
  maxAttempts: 1,
  scheduledAt: new Date(),
  actualStartedAt: null,
  actualEndedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
});
