import {
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import type { UUID } from "crypto";

export interface RoutineTaskNode {
  id: UUID;
  stationId: UUID;
  title: string;
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

export const getDefaultRoutineTaskNode = (
  routineTaskId: UUID,
  stationId: UUID
): RoutineTaskNode => ({
  id: routineTaskId,
  stationId,
  title: "Untitled",
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
