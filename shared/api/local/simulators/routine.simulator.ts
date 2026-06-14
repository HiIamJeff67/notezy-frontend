import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineStatus as GraphQLRoutineStatus,
  SupportedIcon as GraphQLSupportedIcon,
  type SearchRoutineInput,
  SearchRoutineSortBy,
  type SearchRoutinesQuery,
  SearchSortOrder,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  AllAccessControlPermissions,
  RoutineStatus,
} from "@shared/api/interfaces/enums";
import type {
  BulkLinkRoutineItemsByIdsRequest,
  BulkLinkRoutineTagsByIdsRequest,
  CreateRoutineByStationIdRequest,
  CreateRoutinesByStationIdsRequest,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutinesByIdsRequest,
  GetAllMyRoutinesByTimeRangeRequest,
  GetMyRoutineByIdRequest,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutinesByIdsRequest,
  LinkRoutineItemByIdRequest,
  LinkRoutineTagByIdRequest,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutinesByIdsRequest,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutinesByIdsRequest,
} from "@shared/api/interfaces/routine.interface";
import { localDB } from "@shared/api/local/db";
import {
  Item,
  Routine,
  RoutinesToItems,
  RoutinesToTags,
  RoutineTag,
  Station,
  Transaction,
  User,
  UsersToRoutineTags,
  UsersToShelves,
  UsersToStations,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import {
  and,
  asc,
  eq,
  exists,
  gt,
  inArray,
  isNull,
  lt,
  sql,
} from "drizzle-orm";

export class RoutineLocalSimulator {
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
            eq(UsersToStations.stationId, Routine.stationId),
            inArray(UsersToStations.permission, permissions)
          )
        )
    );

  static simulateSearchRoutines = async (
    input: SearchRoutineInput
  ): Promise<SearchRoutinesQuery["searchRoutines"]> => {
    const startedAt = performance.now();
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });

    if (loggedInUser === undefined) {
      return {
        __typename: "SearchRoutineConnection",
        searchEdges: [],
        searchPageInfo: {
          __typename: "SearchPageInfo",
          hasNextPage: false,
          hasPreviousPage: false,
          startEncodedSearchCursor: null,
          endEncodedSearchCursor: null,
        },
        totalCount: 0,
        searchTime: performance.now() - startedAt,
      };
    }

    const accessibleRoutines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        description: Routine.description,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
        stationName: Station.name,
        stationDescription: Station.description,
        stationIcon: Station.icon,
        stationHeaderBackgroundURL: Station.headerBackgroundURL,
        stationPermission: UsersToStations.permission,
        stationRoutineCount: Station.routineCount,
        stationDeletedAt: Station.deletedAt,
        stationUpdatedAt: Station.updatedAt,
        stationCreatedAt: Station.createdAt,
      })
      .from(Routine)
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      );

    const routineIdsByTag =
      input.tagId === undefined || input.tagId === null
        ? null
        : new Set(
            (
              await localDB
                .select({
                  routineId: RoutinesToTags.routineId,
                })
                .from(RoutinesToTags)
                .where(eq(RoutinesToTags.tagId, input.tagId))
            ).map(relation => relation.routineId)
          );
    const normalizedQuery = input.query.trim().toLowerCase();
    const routines = accessibleRoutines.filter(routine => {
      if (routine.deletedAt !== null) return false;
      if (
        input.stationId !== undefined &&
        input.stationId !== null &&
        routine.stationId !== input.stationId
      ) {
        return false;
      }
      if (routineIdsByTag && !routineIdsByTag.has(routine.id)) return false;
      if (normalizedQuery.length === 0) return true;
      return routine.title.toLowerCase().includes(normalizedQuery);
    });

    routines.sort((left, right) => {
      const sortBy = input.sortBy ?? SearchRoutineSortBy.Relevance;
      const sortOrder = input.sortOrder ?? SearchSortOrder.Asc;
      let comparison = 0;

      if (sortBy === SearchRoutineSortBy.Status) {
        comparison = left.status.localeCompare(right.status);
      } else if (sortBy === SearchRoutineSortBy.ScheduledStartAt) {
        comparison =
          left.scheduledStartAt.getTime() - right.scheduledStartAt.getTime();
      } else if (sortBy === SearchRoutineSortBy.ScheduledEndAt) {
        comparison =
          left.scheduledEndAt.getTime() - right.scheduledEndAt.getTime();
      } else if (sortBy === SearchRoutineSortBy.Period) {
        comparison = (left.period ?? "").localeCompare(right.period ?? "");
      } else if (sortBy === SearchRoutineSortBy.LastUpdate) {
        comparison = left.updatedAt.getTime() - right.updatedAt.getTime();
      } else if (sortBy === SearchRoutineSortBy.CreatedAt) {
        comparison = left.createdAt.getTime() - right.createdAt.getTime();
      } else {
        comparison = left.title.localeCompare(right.title);
      }
      if (comparison === 0) {
        comparison = left.title.localeCompare(right.title);
      }
      return sortOrder === SearchSortOrder.Desc ? -comparison : comparison;
    });

    let afterId: string | null = null;
    if (input.after) {
      try {
        const decoded = JSON.parse(atob(input.after)) as {
          id?: unknown;
          fields?: { id?: unknown };
        };
        const decodedId = decoded.id ?? decoded.fields?.id;
        afterId = typeof decodedId === "string" ? decodedId : null;
      } catch {
        afterId = null;
      }
    }
    const afterIndex =
      afterId === null
        ? -1
        : routines.findIndex(routine => routine.id === afterId);
    const startIndex = afterIndex >= 0 ? afterIndex + 1 : 0;
    const first = Math.max(0, input.first ?? 10);
    const pagedRoutines = routines.slice(startIndex, startIndex + first);
    const pagedRoutineIds = pagedRoutines.map(routine => routine.id);
    const linkedTags =
      pagedRoutineIds.length === 0
        ? []
        : await localDB
            .select({
              routineId: RoutinesToTags.routineId,
              id: RoutineTag.id,
              name: RoutineTag.name,
              color: RoutineTag.color,
              icon: RoutineTag.icon,
              updatedAt: RoutineTag.updatedAt,
              createdAt: RoutineTag.createdAt,
            })
            .from(RoutinesToTags)
            .innerJoin(RoutineTag, eq(RoutineTag.id, RoutinesToTags.tagId))
            .where(inArray(RoutinesToTags.routineId, pagedRoutineIds));

    return {
      __typename: "SearchRoutineConnection",
      searchEdges: pagedRoutines.map(routine => {
        const status = (() => {
          switch (routine.status) {
            case "Completed":
              return GraphQLRoutineStatus.RoutineStatusCompleted;
            case "InProgress":
              return GraphQLRoutineStatus.RoutineStatusInProgress;
            case "OverDue":
              return GraphQLRoutineStatus.RoutineStatusOverDue;
            default:
              return GraphQLRoutineStatus.RoutineStatusScheduled;
          }
        })();
        const period = (() => {
          switch (routine.period) {
            case "Daily":
              return GraphQLRoutinePeriod.RoutinePeriodDaily;
            case "Weekly":
              return GraphQLRoutinePeriod.RoutinePeriodWeekly;
            case "Monthly":
              return GraphQLRoutinePeriod.RoutinePeriodMonthly;
            case "Yearly":
              return GraphQLRoutinePeriod.RoutinePeriodYearly;
            default:
              return null;
          }
        })();
        const stationIcon = (() => {
          switch (routine.stationIcon) {
            case "📚":
              return GraphQLSupportedIcon.SupportedIconBooks;
            case "📅":
              return GraphQLSupportedIcon.SupportedIconCalendar;
            case "✅":
              return GraphQLSupportedIcon.SupportedIconCheckMark;
            case "⏰":
              return GraphQLSupportedIcon.SupportedIconClock;
            case "🔥":
              return GraphQLSupportedIcon.SupportedIconFire;
            case "📂":
              return GraphQLSupportedIcon.SupportedIconFolderOpen;
            case "😀":
              return GraphQLSupportedIcon.SupportedIconGrinningFace;
            case "💡":
              return GraphQLSupportedIcon.SupportedIconLightbulb;
            case "📓":
              return GraphQLSupportedIcon.SupportedIconNotebook;
            case "📝":
              return GraphQLSupportedIcon.SupportedIconPencilPaper;
            case "📌":
              return GraphQLSupportedIcon.SupportedIconPin;
            case "❤️":
              return GraphQLSupportedIcon.SupportedIconRedHeart;
            case "🚀":
              return GraphQLSupportedIcon.SupportedIconRocket;
            case "😊":
              return GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes;
            case "⭐":
              return GraphQLSupportedIcon.SupportedIconStar;
            default:
              return null;
          }
        })();

        return {
          __typename: "SearchRoutineEdge",
          encodedSearchCursor: btoa(JSON.stringify({ id: routine.id })),
          node: {
            __typename: "PrivateRoutine",
            id: routine.id,
            stationId: routine.stationId,
            title: routine.title,
            description: routine.description,
            status,
            isPinned: routine.isPinned,
            scheduledStartAt: routine.scheduledStartAt,
            scheduledEndAt: routine.scheduledEndAt,
            period,
            timezone: routine.timezone,
            deletedAt: routine.deletedAt,
            updatedAt: routine.updatedAt,
            createdAt: routine.createdAt,
            station: {
              __typename: "PrivateStation",
              id: routine.stationId,
              name: routine.stationName,
              description: routine.stationDescription,
              icon: stationIcon,
              headerBackgroundURL: routine.stationHeaderBackgroundURL,
              permission: routine.stationPermission,
              routineCount: routine.stationRoutineCount,
              deletedAt: routine.stationDeletedAt,
              updatedAt: routine.stationUpdatedAt,
              createdAt: routine.stationCreatedAt,
            },
            tags: linkedTags
              .filter(tag => tag.routineId === routine.id)
              .map(tag => {
                const icon = (() => {
                  switch (tag.icon) {
                    case "📚":
                      return GraphQLSupportedIcon.SupportedIconBooks;
                    case "📅":
                      return GraphQLSupportedIcon.SupportedIconCalendar;
                    case "✅":
                      return GraphQLSupportedIcon.SupportedIconCheckMark;
                    case "⏰":
                      return GraphQLSupportedIcon.SupportedIconClock;
                    case "🔥":
                      return GraphQLSupportedIcon.SupportedIconFire;
                    case "📂":
                      return GraphQLSupportedIcon.SupportedIconFolderOpen;
                    case "😀":
                      return GraphQLSupportedIcon.SupportedIconGrinningFace;
                    case "💡":
                      return GraphQLSupportedIcon.SupportedIconLightbulb;
                    case "📓":
                      return GraphQLSupportedIcon.SupportedIconNotebook;
                    case "📝":
                      return GraphQLSupportedIcon.SupportedIconPencilPaper;
                    case "📌":
                      return GraphQLSupportedIcon.SupportedIconPin;
                    case "❤️":
                      return GraphQLSupportedIcon.SupportedIconRedHeart;
                    case "🚀":
                      return GraphQLSupportedIcon.SupportedIconRocket;
                    case "😊":
                      return GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes;
                    case "⭐":
                      return GraphQLSupportedIcon.SupportedIconStar;
                    default:
                      return null;
                  }
                })();

                return {
                  __typename: "PrivateRoutineTag",
                  id: tag.id,
                  name: tag.name,
                  color: tag.color,
                  icon,
                  updatedAt: tag.updatedAt,
                  createdAt: tag.createdAt,
                };
              }),
            tasks: [],
          },
        };
      }),
      searchPageInfo: {
        __typename: "SearchPageInfo",
        hasNextPage: startIndex + pagedRoutines.length < routines.length,
        hasPreviousPage: startIndex > 0,
        startEncodedSearchCursor:
          pagedRoutines.length > 0
            ? btoa(JSON.stringify({ id: pagedRoutines[0].id }))
            : null,
        endEncodedSearchCursor:
          pagedRoutines.length > 0
            ? btoa(
                JSON.stringify({
                  id: pagedRoutines[pagedRoutines.length - 1].id,
                })
              )
            : null,
      },
      totalCount: routines.length,
      searchTime: performance.now() - startedAt,
    } as unknown as SearchRoutinesQuery["searchRoutines"];
  };

  static simulateGetMyRoutineById = async (
    request: GetMyRoutineByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return null;

    const routines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        description: Routine.description,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
      })
      .from(Routine)
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      )
      .where(eq(Routine.id, request.param.routineId))
      .limit(1);

    if (!routines[0]) return null;

    const relations = await localDB
      .select({ tagId: RoutinesToTags.tagId })
      .from(RoutinesToTags)
      .where(eq(RoutinesToTags.routineId, routines[0].id));
    return {
      ...routines[0],
      tagIds: relations.map(relation => relation.tagId),
    };
  };

  static simulateGetAllMyRoutinesByTimeRange = async (
    request: GetAllMyRoutinesByTimeRangeRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();
    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (loggedInUser === undefined) return [];

    const routines = await localDB
      .select({
        id: Routine.id,
        stationId: Routine.stationId,
        title: Routine.title,
        description: Routine.description,
        status: Routine.status,
        isPinned: Routine.isPinned,
        scheduledStartAt: Routine.scheduledStartAt,
        scheduledEndAt: Routine.scheduledEndAt,
        period: Routine.period,
        timezone: Routine.timezone,
        deletedAt: Routine.deletedAt,
        updatedAt: Routine.updatedAt,
        createdAt: Routine.createdAt,
      })
      .from(Routine)
      .innerJoin(Station, eq(Station.id, Routine.stationId))
      .innerJoin(
        UsersToStations,
        and(
          eq(UsersToStations.stationId, Routine.stationId),
          eq(UsersToStations.userPublicId, loggedInUser.publicId),
          inArray(UsersToStations.permission, AllAccessControlPermissions)
        )
      )
      .where(
        and(
          inArray(Routine.stationId, request.param.stationIds),
          isNull(Station.deletedAt),
          isNull(Routine.deletedAt),
          lt(Routine.scheduledStartAt, request.param.to),
          gt(Routine.scheduledEndAt, request.param.from)
        )
      )
      .orderBy(
        asc(Routine.scheduledStartAt),
        asc(Routine.scheduledEndAt),
        asc(Routine.id)
      );
    if (routines.length === 0) return [];

    const relations = await localDB
      .select({
        routineId: RoutinesToTags.routineId,
        tagId: RoutinesToTags.tagId,
      })
      .from(RoutinesToTags)
      .where(
        inArray(
          RoutinesToTags.routineId,
          routines.map(routine => routine.id)
        )
      );
    return routines.map(routine => ({
      ...routine,
      tagIds: relations
        .filter(relation => relation.routineId === routine.id)
        .map(relation => relation.tagId),
    }));
  };

  static simulateCreateRoutineByStationId = async (
    request: CreateRoutineByStationIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const permittedStations = await tx
        .select({ id: Station.id })
        .from(Station)
        .innerJoin(
          UsersToStations,
          and(
            eq(UsersToStations.stationId, Station.id),
            eq(UsersToStations.userPublicId, loggedInUser.publicId),
            inArray(UsersToStations.permission, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        )
        .where(
          and(
            eq(Station.id, request.body.stationId),
            sql`${Station.deletedAt} IS NULL`
          )
        );
      if (permittedStations.length === 0) return;

      const id = request.body.id ?? generateUUID();
      const createdAt = new Date();
      request.body.id = id;
      await tx.insert(Routine).values({
        id,
        stationId: request.body.stationId,
        title: request.body.title,
        description: request.body.description,
        status: request.body.status ?? RoutineStatus.Scheduled,
        isPinned: request.body.isPinned ?? false,
        scheduledStartAt: request.body.scheduledStartAt ?? createdAt,
        scheduledEndAt: request.body.scheduledEndAt ?? createdAt,
        period: request.body.period ?? null,
        timezone: request.body.timezone ?? "UTC",
        createdAt,
        updatedAt: createdAt,
      });
      await tx
        .update(Station)
        .set({
          routineCount: sql`${Station.routineCount} + 1`,
          updatedAt: createdAt,
        })
        .where(eq(Station.id, request.body.stationId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateCreateRoutinesByStationIds = async (
    request: CreateRoutinesByStationIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const stationIds = [
        ...new Set(
          request.body.createdRoutines.map(routine => routine.stationId)
        ),
      ];
      const permittedStations =
        stationIds.length === 0
          ? []
          : await tx
              .select({ id: Station.id })
              .from(Station)
              .innerJoin(
                UsersToStations,
                and(
                  eq(UsersToStations.stationId, Station.id),
                  eq(UsersToStations.userPublicId, loggedInUser.publicId),
                  inArray(UsersToStations.permission, [
                    AccessControlPermission.Owner,
                    AccessControlPermission.Admin,
                    AccessControlPermission.Write,
                  ])
                )
              )
              .where(
                and(
                  inArray(Station.id, stationIds),
                  sql`${Station.deletedAt} IS NULL`
                )
              );
      const permittedStationIds = new Set(
        permittedStations.map(station => station.id)
      );
      const createdAt = new Date();
      request.body.createdRoutines = request.body.createdRoutines.filter(
        routine => permittedStationIds.has(routine.stationId)
      );
      const routines = request.body.createdRoutines.map(routine => {
        const id = routine.id ?? generateUUID();
        routine.id = id;
        return {
          id,
          stationId: routine.stationId,
          title: routine.title,
          description: routine.description,
          status: routine.status ?? RoutineStatus.Scheduled,
          isPinned: routine.isPinned ?? false,
          scheduledStartAt: routine.scheduledStartAt ?? createdAt,
          scheduledEndAt: routine.scheduledEndAt ?? createdAt,
          period: routine.period ?? null,
          timezone: routine.timezone ?? "UTC",
          createdAt,
          updatedAt: createdAt,
        };
      });
      if (routines.length === 0) return;

      await tx.insert(Routine).values(routines);
      const routineCounts = new Map<string, number>();
      for (const routine of routines) {
        routineCounts.set(
          routine.stationId,
          (routineCounts.get(routine.stationId) ?? 0) + 1
        );
      }
      for (const [stationId, count] of routineCounts) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`${Station.routineCount} + ${count}`,
            updatedAt: createdAt,
          })
          .where(eq(Station.id, stationId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRoutineById = async (
    request: UpdateMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const existingRoutine = await tx.query.Routine.findFirst({
        where: and(
          eq(Routine.id, request.body.routineId),
          RoutineLocalSimulator.getPassPermissionCheckSQL(
            tx,
            loggedInUser.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ]
          )
        ),
      });
      if (existingRoutine === undefined) return;

      if (
        request.body.values.stationId !== undefined &&
        request.body.values.stationId !== existingRoutine.stationId
      ) {
        const targetStation = await tx
          .select({ id: Station.id })
          .from(Station)
          .innerJoin(
            UsersToStations,
            and(
              eq(UsersToStations.stationId, Station.id),
              eq(UsersToStations.userPublicId, loggedInUser.publicId),
              inArray(UsersToStations.permission, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
            )
          )
          .where(eq(Station.id, request.body.values.stationId));
        if (targetStation.length === 0) return;
      }

      const updatedAt = new Date();
      await tx
        .update(Routine)
        .set({
          ...(request.body.values.stationId !== undefined && {
            stationId: request.body.values.stationId,
          }),
          ...(request.body.values.title !== undefined && {
            title: request.body.values.title,
          }),
          ...(request.body.values.description !== undefined && {
            description: request.body.values.description,
          }),
          ...(request.body.values.status !== undefined && {
            status: request.body.values.status,
          }),
          ...(request.body.values.isPinned !== undefined && {
            isPinned: request.body.values.isPinned,
          }),
          ...(request.body.values.scheduledStartAt !== undefined && {
            scheduledStartAt: request.body.values.scheduledStartAt,
          }),
          ...(request.body.values.scheduledEndAt !== undefined && {
            scheduledEndAt: request.body.values.scheduledEndAt,
          }),
          ...(request.body.values.period !== undefined && {
            period: request.body.values.period,
          }),
          ...(request.body.values.timezone !== undefined && {
            timezone: request.body.values.timezone,
          }),
          ...(request.body.setNull?.period && { period: null }),
          updatedAt,
        })
        .where(eq(Routine.id, request.body.routineId));

      if (
        request.body.values.stationId !== undefined &&
        request.body.values.stationId !== existingRoutine.stationId
      ) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
            updatedAt,
          })
          .where(eq(Station.id, existingRoutine.stationId));
        await tx
          .update(Station)
          .set({
            routineCount: sql`${Station.routineCount} + 1`,
            updatedAt,
          })
          .where(eq(Station.id, request.body.values.stationId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyRoutinesByIds = async (
    request: UpdateMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const updatedAt = new Date();
      const validUpdates = [];
      for (const routine of request.body.updatedRoutines) {
        const existingRoutine = await tx.query.Routine.findFirst({
          where: and(
            eq(Routine.id, routine.routineId),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          ),
        });
        if (existingRoutine === undefined) continue;

        if (
          routine.values.stationId !== undefined &&
          routine.values.stationId !== existingRoutine.stationId
        ) {
          const targetStation = await tx
            .select({ id: Station.id })
            .from(Station)
            .innerJoin(
              UsersToStations,
              and(
                eq(UsersToStations.stationId, Station.id),
                eq(UsersToStations.userPublicId, loggedInUser.publicId),
                inArray(UsersToStations.permission, [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ])
              )
            )
            .where(eq(Station.id, routine.values.stationId));
          if (targetStation.length === 0) continue;
        }

        await tx
          .update(Routine)
          .set({
            ...(routine.values.stationId !== undefined && {
              stationId: routine.values.stationId,
            }),
            ...(routine.values.title !== undefined && {
              title: routine.values.title,
            }),
            ...(routine.values.description !== undefined && {
              description: routine.values.description,
            }),
            ...(routine.values.status !== undefined && {
              status: routine.values.status,
            }),
            ...(routine.values.isPinned !== undefined && {
              isPinned: routine.values.isPinned,
            }),
            ...(routine.values.scheduledStartAt !== undefined && {
              scheduledStartAt: routine.values.scheduledStartAt,
            }),
            ...(routine.values.scheduledEndAt !== undefined && {
              scheduledEndAt: routine.values.scheduledEndAt,
            }),
            ...(routine.values.period !== undefined && {
              period: routine.values.period,
            }),
            ...(routine.values.timezone !== undefined && {
              timezone: routine.values.timezone,
            }),
            ...(routine.setNull?.period && { period: null }),
            updatedAt,
          })
          .where(eq(Routine.id, routine.routineId));

        if (
          routine.values.stationId !== undefined &&
          routine.values.stationId !== existingRoutine.stationId
        ) {
          await tx
            .update(Station)
            .set({
              routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
              updatedAt,
            })
            .where(eq(Station.id, existingRoutine.stationId));
          await tx
            .update(Station)
            .set({
              routineCount: sql`${Station.routineCount} + 1`,
              updatedAt,
            })
            .where(eq(Station.id, routine.values.stationId));
        }
        validUpdates.push(routine);
      }
      if (validUpdates.length === 0) return;

      request.body.updatedRoutines = validUpdates;
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateLinkRoutineTagById = async (
    request: LinkRoutineTagByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            sql`${Routine.deletedAt} IS NULL`,
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      const tags = await tx
        .select({ id: UsersToRoutineTags.tagId })
        .from(UsersToRoutineTags)
        .where(
          and(
            eq(UsersToRoutineTags.userPublicId, loggedInUser.publicId),
            eq(UsersToRoutineTags.tagId, request.body.routineTagId),
            inArray(UsersToRoutineTags.permission, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        );
      if (routines.length === 0 || tags.length === 0) return;

      await tx
        .delete(RoutinesToTags)
        .where(
          and(
            eq(RoutinesToTags.routineId, request.body.routineId),
            eq(RoutinesToTags.tagId, request.body.routineTagId)
          )
        );
      if (!request.body.isUnlink) {
        await tx.insert(RoutinesToTags).values({
          routineId: request.body.routineId,
          tagId: request.body.routineTagId,
        });
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToTags,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateBulkLinkRoutineTagsByIds = async (
    request: BulkLinkRoutineTagsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const validRelations = [];
      for (const relation of request.body.linkedRoutinesAndTags) {
        const routines = await tx
          .select({ id: Routine.id })
          .from(Routine)
          .where(
            and(
              eq(Routine.id, relation.routineId),
              sql`${Routine.deletedAt} IS NULL`,
              RoutineLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
        const tags = await tx
          .select({ id: UsersToRoutineTags.tagId })
          .from(UsersToRoutineTags)
          .where(
            and(
              eq(UsersToRoutineTags.userPublicId, loggedInUser.publicId),
              eq(UsersToRoutineTags.tagId, relation.routineTagId),
              inArray(UsersToRoutineTags.permission, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
            )
          );
        if (routines.length === 0 || tags.length === 0) continue;

        await tx
          .delete(RoutinesToTags)
          .where(
            and(
              eq(RoutinesToTags.routineId, relation.routineId),
              eq(RoutinesToTags.tagId, relation.routineTagId)
            )
          );
        if (!request.body.isUnlink) {
          await tx.insert(RoutinesToTags).values({
            routineId: relation.routineId,
            tagId: relation.routineTagId,
          });
        }
        validRelations.push(relation);
      }
      if (validRelations.length === 0) return;

      request.body.linkedRoutinesAndTags = validRelations;
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToTags,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateLinkRoutineItemById = async (
    request: LinkRoutineItemByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routines = await tx
        .select({ id: Routine.id })
        .from(Routine)
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            sql`${Routine.deletedAt} IS NULL`,
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      const items = await tx
        .select({ id: Item.id })
        .from(Item)
        .innerJoin(
          UsersToShelves,
          and(
            eq(UsersToShelves.rootShelfId, Item.rootShelfId),
            eq(UsersToShelves.userPublicId, loggedInUser.publicId),
            inArray(UsersToShelves.permission, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        )
        .where(
          and(
            eq(Item.id, request.body.itemId),
            eq(Item.type, request.body.itemType),
            sql`${Item.deletedAt} IS NULL`
          )
        );
      if (routines.length === 0 || items.length === 0) return;

      await tx
        .delete(RoutinesToItems)
        .where(
          and(
            eq(RoutinesToItems.routineId, request.body.routineId),
            eq(RoutinesToItems.itemId, request.body.itemId)
          )
        );
      if (!request.body.isUnlink) {
        await tx.insert(RoutinesToItems).values({
          routineId: request.body.routineId,
          itemId: request.body.itemId,
        });
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToItems,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateBulkLinkRoutineItemsByIds = async (
    request: BulkLinkRoutineItemsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const validRelations = [];
      for (const relation of request.body.linkedRoutinesAndItems) {
        const routines = await tx
          .select({ id: Routine.id })
          .from(Routine)
          .where(
            and(
              eq(Routine.id, relation.routineId),
              sql`${Routine.deletedAt} IS NULL`,
              RoutineLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );
        const items = await tx
          .select({ id: Item.id })
          .from(Item)
          .innerJoin(
            UsersToShelves,
            and(
              eq(UsersToShelves.rootShelfId, Item.rootShelfId),
              eq(UsersToShelves.userPublicId, loggedInUser.publicId),
              inArray(UsersToShelves.permission, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
            )
          )
          .where(
            and(
              eq(Item.id, relation.itemId),
              eq(Item.type, relation.itemType),
              sql`${Item.deletedAt} IS NULL`
            )
          );
        if (routines.length === 0 || items.length === 0) continue;

        await tx
          .delete(RoutinesToItems)
          .where(
            and(
              eq(RoutinesToItems.routineId, relation.routineId),
              eq(RoutinesToItems.itemId, relation.itemId)
            )
          );
        if (!request.body.isUnlink) {
          await tx.insert(RoutinesToItems).values({
            routineId: relation.routineId,
            itemId: relation.itemId,
          });
        }
        validRelations.push(relation);
      }
      if (validRelations.length === 0) return;

      request.body.linkedRoutinesAndItems = validRelations;
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RoutinesToItems,
        actionType: request.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyRoutineById = async (
    request: RestoreMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(Routine)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyRoutinesByIds = async (
    request: RestoreMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      await tx
        .update(Routine)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            inArray(Routine.id, request.body.routineIds),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyRoutineById = async (
    request: DeleteMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const deletedAt = new Date();
      await tx
        .update(Routine)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            eq(Routine.id, request.body.routineId),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyRoutinesByIds = async (
    request: DeleteMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const deletedAt = new Date();
      await tx
        .update(Routine)
        .set({ deletedAt, updatedAt: deletedAt })
        .where(
          and(
            inArray(Routine.id, request.body.routineIds),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyRoutineById = async (
    request: HardDeleteMyRoutineByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routine = await tx.query.Routine.findFirst({
        where: and(
          eq(Routine.id, request.body.routineId),
          RoutineLocalSimulator.getPassPermissionCheckSQL(
            tx,
            loggedInUser.publicId,
            [AccessControlPermission.Owner, AccessControlPermission.Admin]
          )
        ),
      });
      if (routine === undefined) return;

      const deletedAt = new Date();
      await tx
        .delete(RoutinesToItems)
        .where(eq(RoutinesToItems.routineId, request.body.routineId));
      await tx
        .delete(RoutinesToTags)
        .where(eq(RoutinesToTags.routineId, request.body.routineId));
      await tx.delete(Routine).where(eq(Routine.id, request.body.routineId));
      await tx
        .update(Station)
        .set({
          routineCount: sql`MAX(0, ${Station.routineCount} - 1)`,
          updatedAt: deletedAt,
        })
        .where(eq(Station.id, routine.stationId));
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.HARD_DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateHardDeleteMyRoutinesByIds = async (
    request: HardDeleteMyRoutinesByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;

      const routines = await tx
        .select({ id: Routine.id, stationId: Routine.stationId })
        .from(Routine)
        .where(
          and(
            inArray(Routine.id, request.body.routineIds),
            RoutineLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );
      const routineIds = routines.map(routine => routine.id);
      if (routineIds.length === 0) return;

      const deletedAt = new Date();
      await tx
        .delete(RoutinesToItems)
        .where(inArray(RoutinesToItems.routineId, routineIds));
      await tx
        .delete(RoutinesToTags)
        .where(inArray(RoutinesToTags.routineId, routineIds));
      await tx.delete(Routine).where(inArray(Routine.id, routineIds));

      const routineCounts = new Map<string, number>();
      for (const routine of routines) {
        routineCounts.set(
          routine.stationId,
          (routineCounts.get(routine.stationId) ?? 0) + 1
        );
      }
      for (const [stationId, count] of routineCounts) {
        await tx
          .update(Station)
          .set({
            routineCount: sql`MAX(0, ${Station.routineCount} - ${count})`,
            updatedAt: deletedAt,
          })
          .where(eq(Station.id, stationId));
      }
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Routine,
        actionType: TransactionActionType.HARD_DELETE,
        body: {
          ...request.body,
          routineIds,
        },
        affected: request.affected,
      });
    });
  };
}
