import {
  AccessControlPermission,
  AllAccessControlPermissions,
} from "@shared/api/interfaces/enums";
import type {
  GetAllMyRoutineTasksByStationIdsRequest,
  GetAllMyRoutineTasksRequest,
  GetMyRoutineTaskByIdRequest,
} from "@shared/api/interfaces/routineTask.interface";
import { localDB } from "@shared/api/local/db";
import {
  RoutineTask,
  Station,
  User,
  UsersToStations,
} from "@shared/api/local/schemas";
import { and, asc, desc, eq, exists, inArray, isNull, sql } from "drizzle-orm";

export class RoutineTaskLocalSimulator {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[]
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToStations)
        .where(
          and(
            eq(UsersToStations.userPublicId, userPublicId),
            eq(UsersToStations.stationId, RoutineTask.stationId),
            inArray(UsersToStations.permission, permissions)
          )
        )
    );

  static simulateGetMyRoutineTaskById = async (
    request: GetMyRoutineTaskByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    if (request.param.isDeleted === true) return null;

    const routineTasks = await localDB
      .select()
      .from(RoutineTask)
      .innerJoin(Station, eq(Station.id, RoutineTask.stationId))
      .where(
        and(
          eq(RoutineTask.id, request.param.routineTaskId),
          isNull(Station.deletedAt),
          RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            AllAccessControlPermissions
          )
        )
      )
      .limit(1);

    return routineTasks[0]?.RoutineTaskTable ?? null;
  };

  static simulateGetAllMyRoutineTasksByStationIds = async (
    request: GetAllMyRoutineTasksByStationIdsRequest
  ) => {
    if (request.param.areDeleted === true) return [];

    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    return await localDB
      .select({
        id: RoutineTask.id,
        stationId: RoutineTask.stationId,
        title: RoutineTask.title,
        purpose: RoutineTask.purpose,
        costUnit: RoutineTask.costUnit,
        priority: RoutineTask.priority,
        status: RoutineTask.status,
        attempts: RoutineTask.attempts,
        maxAttempts: RoutineTask.maxAttempts,
        period: RoutineTask.period,
        scheduledAt: RoutineTask.scheduledAt,
        actualStartedAt: RoutineTask.actualStartedAt,
        actualEndedAt: RoutineTask.actualEndedAt,
        updatedAt: RoutineTask.updatedAt,
        createdAt: RoutineTask.createdAt,
      })
      .from(RoutineTask)
      .innerJoin(Station, eq(Station.id, RoutineTask.stationId))
      .where(
        and(
          inArray(RoutineTask.stationId, request.param.stationIds),
          isNull(Station.deletedAt),
          RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            AllAccessControlPermissions
          )
        )
      )
      .orderBy(
        asc(RoutineTask.scheduledAt),
        desc(RoutineTask.priority),
        asc(RoutineTask.id)
      );
  };

  static simulateGetAllMyRoutineTasks = async (
    request?: GetAllMyRoutineTasksRequest
  ) => {
    if (request?.param?.areDeleted === true) return [];

    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    return await localDB
      .select({
        id: RoutineTask.id,
        stationId: RoutineTask.stationId,
        title: RoutineTask.title,
        purpose: RoutineTask.purpose,
        costUnit: RoutineTask.costUnit,
        payload: RoutineTask.payload,
        priority: RoutineTask.priority,
        status: RoutineTask.status,
        attempts: RoutineTask.attempts,
        maxAttempts: RoutineTask.maxAttempts,
        period: RoutineTask.period,
        scheduledAt: RoutineTask.scheduledAt,
        actualStartedAt: RoutineTask.actualStartedAt,
        actualEndedAt: RoutineTask.actualEndedAt,
        updatedAt: RoutineTask.updatedAt,
        createdAt: RoutineTask.createdAt,
      })
      .from(RoutineTask)
      .innerJoin(Station, eq(Station.id, RoutineTask.stationId))
      .where(
        and(
          isNull(Station.deletedAt),
          RoutineTaskLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            AllAccessControlPermissions
          )
        )
      )
      .orderBy(
        asc(RoutineTask.scheduledAt),
        desc(RoutineTask.priority),
        asc(RoutineTask.id)
      );
  };
}
