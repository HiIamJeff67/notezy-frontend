import type {
  GetAllMyRoutineTasksByStationIdsResponse,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdResponse,
} from "@shared/api/interfaces/routineTask.interface";
import { localDB } from "@shared/api/local/db";
import { RoutineTask } from "@shared/api/local/schemas";
import { sql } from "drizzle-orm";

export class RoutineTaskLocalSynchronizer {
  static syncGetMyRoutineTaskById = async (
    response: GetMyRoutineTaskByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(RoutineTask)
      .values(response.data)
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          stationId: response.data.stationId,
          title: response.data.title,
          purpose: response.data.purpose,
          payload: response.data.payload,
          priority: response.data.priority,
          status: response.data.status,
          attempts: response.data.attempts,
          maxAttempts: response.data.maxAttempts,
          scheduledAt: response.data.scheduledAt,
          actualStartedAt: response.data.actualStartedAt,
          actualEndedAt: response.data.actualEndedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetAllMyRoutineTasksByStationIds = async (
    response: GetAllMyRoutineTasksByStationIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB
      .insert(RoutineTask)
      .values(
        response.data.map(routineTask => ({
          id: routineTask.id,
          stationId: routineTask.stationId,
          title: routineTask.title,
          purpose: routineTask.purpose,
          payload: {},
          priority: routineTask.priority,
          status: routineTask.status,
          attempts: routineTask.attempts,
          maxAttempts: routineTask.maxAttempts,
          scheduledAt: routineTask.scheduledAt,
          actualStartedAt: routineTask.actualStartedAt,
          actualEndedAt: routineTask.actualEndedAt,
          updatedAt: routineTask.updatedAt,
          createdAt: routineTask.createdAt,
        }))
      )
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          stationId: sql`excluded.station_id`,
          title: sql`excluded.title`,
          purpose: sql`excluded.purpose`,
          priority: sql`excluded.priority`,
          status: sql`excluded.status`,
          attempts: sql`excluded.attempts`,
          maxAttempts: sql`excluded.max_attempts`,
          scheduledAt: sql`excluded.scheduled_at`,
          actualStartedAt: sql`excluded.actual_started_at`,
          actualEndedAt: sql`excluded.actual_ended_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetAllMyRoutineTasks = async (
    response: GetAllMyRoutineTasksResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    if (response.data.length === 0) return;

    await localDB
      .insert(RoutineTask)
      .values(response.data)
      .onConflictDoUpdate({
        target: RoutineTask.id,
        set: {
          stationId: sql`excluded.station_id`,
          title: sql`excluded.title`,
          purpose: sql`excluded.purpose`,
          payload: sql`excluded.payload`,
          priority: sql`excluded.priority`,
          status: sql`excluded.status`,
          attempts: sql`excluded.attempts`,
          maxAttempts: sql`excluded.max_attempts`,
          scheduledAt: sql`excluded.scheduled_at`,
          actualStartedAt: sql`excluded.actual_started_at`,
          actualEndedAt: sql`excluded.actual_ended_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };
}
