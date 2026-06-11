import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  RoutinePeriod as GraphQLRoutinePeriod,
  RoutineStatus as GraphQLRoutineStatus,
  SupportedIcon as GraphQLSupportedIcon,
  SearchRoutinesDocument,
  type SearchRoutinesQuery,
  type SearchRoutinesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  RoutinePeriod,
  RoutineStatus,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import { RoutineLocalSimulator } from "@shared/api/local/simulators/routine.simulator";
import { RoutineLocalSynchronizer } from "@shared/api/local/synchronizers/routine.synchronizer";
import { useEffect, useMemo, useRef } from "react";
import { isNetworkFallbackError } from "./error";

const alignSearchedRoutines = (
  data?: SearchRoutinesQuery
): Array<{
  id: string;
  stationId: string;
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
  station: {
    id: string;
    name: string;
    description: string;
    icon: SupportedIcon | null;
    headerBackgroundURL: string | null;
    permission: AccessControlPermission;
    routineCount: number;
    deletedAt: Date | null;
    updatedAt: Date;
    createdAt: Date;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
    icon: SupportedIcon | null;
    updatedAt: Date;
    createdAt: Date;
  }>;
}> =>
  data?.searchRoutines.searchEdges.map(edge => {
    const node = edge.node as unknown as {
      id: string;
      stationId: string;
      title: string;
      description: string;
      status: GraphQLRoutineStatus;
      isPinned: boolean;
      scheduledStartAt: Date | string | number;
      scheduledEndAt: Date | string | number;
      period: GraphQLRoutinePeriod | null;
      timezone: string;
      deletedAt: Date | string | number | null;
      updatedAt: Date | string | number;
      createdAt: Date | string | number;
      station: {
        id: string;
        name: string;
        description: string;
        icon: GraphQLSupportedIcon | null;
        headerBackgroundURL: string | null;
        permission: AccessControlPermission;
        routineCount: number;
        deletedAt: Date | string | number | null;
        updatedAt: Date | string | number;
        createdAt: Date | string | number;
      };
      tags: Array<{
        id: string;
        name: string;
        color: string;
        icon: GraphQLSupportedIcon | null;
        updatedAt: Date | string | number;
        createdAt: Date | string | number;
      }>;
    };

    const status = (() => {
      switch (node.status) {
        case GraphQLRoutineStatus.RoutineStatusCompleted:
          return RoutineStatus.Completed;
        case GraphQLRoutineStatus.RoutineStatusInProgress:
          return RoutineStatus.InProgress;
        case GraphQLRoutineStatus.RoutineStatusOverDue:
          return RoutineStatus.OverDue;
        case GraphQLRoutineStatus.RoutineStatusScheduled:
          return RoutineStatus.Scheduled;
      }
    })();
    const period = (() => {
      switch (node.period) {
        case GraphQLRoutinePeriod.RoutinePeriodDaily:
          return RoutinePeriod.Daily;
        case GraphQLRoutinePeriod.RoutinePeriodWeekly:
          return RoutinePeriod.Weekly;
        case GraphQLRoutinePeriod.RoutinePeriodMonthly:
          return RoutinePeriod.Monthly;
        case GraphQLRoutinePeriod.RoutinePeriodYearly:
          return RoutinePeriod.Yearly;
        default:
          return null;
      }
    })();
    const stationIcon = (() => {
      switch (node.station.icon) {
        case GraphQLSupportedIcon.SupportedIconBooks:
          return SupportedIcon.Books;
        case GraphQLSupportedIcon.SupportedIconCalendar:
          return SupportedIcon.Calendar;
        case GraphQLSupportedIcon.SupportedIconCheckMark:
          return SupportedIcon.CheckMark;
        case GraphQLSupportedIcon.SupportedIconClock:
          return SupportedIcon.Clock;
        case GraphQLSupportedIcon.SupportedIconFire:
          return SupportedIcon.Fire;
        case GraphQLSupportedIcon.SupportedIconFolderOpen:
          return SupportedIcon.FolderOpen;
        case GraphQLSupportedIcon.SupportedIconGrinningFace:
          return SupportedIcon.GrinningFace;
        case GraphQLSupportedIcon.SupportedIconLightbulb:
          return SupportedIcon.Lightbulb;
        case GraphQLSupportedIcon.SupportedIconNotebook:
          return SupportedIcon.Notebook;
        case GraphQLSupportedIcon.SupportedIconPencilPaper:
          return SupportedIcon.PencilPaper;
        case GraphQLSupportedIcon.SupportedIconPin:
          return SupportedIcon.Pin;
        case GraphQLSupportedIcon.SupportedIconRedHeart:
          return SupportedIcon.RedHeart;
        case GraphQLSupportedIcon.SupportedIconRocket:
          return SupportedIcon.Rocket;
        case GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes:
          return SupportedIcon.SmilingFaceWithSmilingEyes;
        case GraphQLSupportedIcon.SupportedIconStar:
          return SupportedIcon.Star;
        default:
          return null;
      }
    })();

    return {
      id: node.id,
      stationId: node.stationId,
      title: node.title,
      description: node.description,
      status,
      isPinned: node.isPinned,
      scheduledStartAt: new Date(node.scheduledStartAt ?? 0),
      scheduledEndAt: new Date(node.scheduledEndAt ?? 0),
      period,
      timezone: node.timezone,
      deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt ?? 0),
      updatedAt: new Date(node.updatedAt ?? 0),
      createdAt: new Date(node.createdAt ?? 0),
      station: {
        id: node.station.id,
        name: node.station.name,
        description: node.station.description,
        icon: stationIcon,
        headerBackgroundURL: node.station.headerBackgroundURL,
        permission: node.station
          .permission as unknown as AccessControlPermission,
        routineCount: node.station.routineCount,
        deletedAt:
          node.station.deletedAt === null
            ? null
            : new Date(node.station.deletedAt ?? 0),
        updatedAt: new Date(node.station.updatedAt ?? 0),
        createdAt: new Date(node.station.createdAt ?? 0),
      },
      tags: node.tags.map(tag => {
        const icon = (() => {
          switch (tag.icon) {
            case GraphQLSupportedIcon.SupportedIconBooks:
              return SupportedIcon.Books;
            case GraphQLSupportedIcon.SupportedIconCalendar:
              return SupportedIcon.Calendar;
            case GraphQLSupportedIcon.SupportedIconCheckMark:
              return SupportedIcon.CheckMark;
            case GraphQLSupportedIcon.SupportedIconClock:
              return SupportedIcon.Clock;
            case GraphQLSupportedIcon.SupportedIconFire:
              return SupportedIcon.Fire;
            case GraphQLSupportedIcon.SupportedIconFolderOpen:
              return SupportedIcon.FolderOpen;
            case GraphQLSupportedIcon.SupportedIconGrinningFace:
              return SupportedIcon.GrinningFace;
            case GraphQLSupportedIcon.SupportedIconLightbulb:
              return SupportedIcon.Lightbulb;
            case GraphQLSupportedIcon.SupportedIconNotebook:
              return SupportedIcon.Notebook;
            case GraphQLSupportedIcon.SupportedIconPencilPaper:
              return SupportedIcon.PencilPaper;
            case GraphQLSupportedIcon.SupportedIconPin:
              return SupportedIcon.Pin;
            case GraphQLSupportedIcon.SupportedIconRedHeart:
              return SupportedIcon.RedHeart;
            case GraphQLSupportedIcon.SupportedIconRocket:
              return SupportedIcon.Rocket;
            case GraphQLSupportedIcon.SupportedIconSmilingFaceWithSmilingEyes:
              return SupportedIcon.SmilingFaceWithSmilingEyes;
            case GraphQLSupportedIcon.SupportedIconStar:
              return SupportedIcon.Star;
            default:
              return null;
          }
        })();

        return {
          id: tag.id,
          name: tag.name,
          color: tag.color,
          icon,
          updatedAt: new Date(tag.updatedAt ?? 0),
          createdAt: new Date(tag.createdAt ?? 0),
        };
      }),
    };
  }) ?? [];

export const useSearchRoutinesLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutinesQuery,
    SearchRoutinesQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutinesQuery,
  SearchRoutinesQueryVariables
> => {
  const [execute, result] = useLazyQuery<
    SearchRoutinesQuery,
    SearchRoutinesQueryVariables
  >(SearchRoutinesDocument, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchRoutinesQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchRoutines.totalCount ?? 0,
      endCursor: data?.searchRoutines.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutines.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            stationId: string;
            updatedAt: Date | string | number;
          };
          return {
            cursor: edge.encodedSearchCursor,
            id: node.id,
            stationId: node.stationId,
            updatedAt: new Date(node.updatedAt ?? 0).getTime(),
          };
        }) ?? [],
    });
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;

    void RoutineLocalSynchronizer.syncSearchRoutines(
      alignSearchedRoutines(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched routines to local db",
        error
      )
    );
  };

  const executeWithSync: typeof execute = executeOptions => {
    const queryPromise = execute(executeOptions);
    const handledPromise = queryPromise
      .then(queryResult => {
        syncWithSignatureGuard(queryResult.data);
        return queryResult;
      })
      .catch(async error => {
        if (!isNetworkFallbackError(error)) throw error;

        const variables =
          (executeOptions?.variables as
            | SearchRoutinesQueryVariables
            | undefined) ??
          (result.variables as SearchRoutinesQueryVariables | undefined);
        if (variables?.input === undefined) throw error;

        const fallbackSearchRoutines =
          await RoutineLocalSimulator.simulateSearchRoutines(variables.input);
        result.client.writeQuery<
          SearchRoutinesQuery,
          SearchRoutinesQueryVariables
        >({
          query: SearchRoutinesDocument,
          variables,
          data: {
            __typename: "Query",
            searchRoutines: fallbackSearchRoutines,
          },
        });
        return {
          data: {
            __typename: "Query",
            searchRoutines: fallbackSearchRoutines,
          },
        } as any;
      }) as ReturnType<typeof execute>;

    handledPromise.retain = () => {
      queryPromise.retain();
      return handledPromise;
    };
    return handledPromise;
  };

  const fetchMoreWithFallback = (async fetchMoreOptions => {
    try {
      const fetchResult = await result.fetchMore(fetchMoreOptions);
      syncWithSignatureGuard(fetchResult.data as SearchRoutinesQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const variables = fetchMoreOptions.variables as
        | SearchRoutinesQueryVariables
        | undefined;
      if (variables?.input === undefined) throw error;

      const fallbackSearchRoutines =
        await RoutineLocalSimulator.simulateSearchRoutines(variables.input);
      result.client.writeQuery<
        SearchRoutinesQuery,
        SearchRoutinesQueryVariables
      >({
        query: SearchRoutinesDocument,
        variables,
        data: {
          __typename: "Query",
          searchRoutines: fallbackSearchRoutines,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchRoutines: fallbackSearchRoutines,
        },
      } as any;
    }
  }) as typeof result.fetchMore;

  return [
    executeWithSync,
    useMemo(
      () => ({
        ...result,
        fetchMore: fetchMoreWithFallback,
      }),
      [fetchMoreWithFallback, result]
    ),
  ];
};

export const useSearchRoutinesQuery = (
  variables: SearchRoutinesQueryVariables,
  options?: useQuery.Options<SearchRoutinesQuery, SearchRoutinesQueryVariables>
) => {
  const queryResult = useQuery<
    SearchRoutinesQuery,
    SearchRoutinesQueryVariables
  >(SearchRoutinesDocument, {
    variables,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");
  const latestFallbackKeyRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchRoutinesQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchRoutines.totalCount ?? 0,
      endCursor: data?.searchRoutines.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutines.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            stationId: string;
            updatedAt: Date | string | number;
          };
          return {
            cursor: edge.encodedSearchCursor,
            id: node.id,
            stationId: node.stationId,
            updatedAt: new Date(node.updatedAt ?? 0).getTime(),
          };
        }) ?? [],
    });
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;

    void RoutineLocalSynchronizer.syncSearchRoutines(
      alignSearchedRoutines(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched routines to local db",
        error
      )
    );
  };

  useEffect(() => {
    syncWithSignatureGuard(queryResult.data);
  }, [queryResult.data]);

  useEffect(() => {
    if (queryResult.error === undefined) return;
    if (!isNetworkFallbackError(queryResult.error)) return;

    const fallbackVariables =
      (queryResult.variables as SearchRoutinesQueryVariables | undefined) ??
      variables;
    if (fallbackVariables?.input === undefined) return;

    const fallbackKey = JSON.stringify(fallbackVariables.input);
    if (fallbackKey === latestFallbackKeyRef.current) return;
    latestFallbackKeyRef.current = fallbackKey;

    let cancelled = false;
    void (async () => {
      const fallbackSearchRoutines =
        await RoutineLocalSimulator.simulateSearchRoutines(
          fallbackVariables.input
        );
      if (cancelled) return;
      queryResult.client.writeQuery<
        SearchRoutinesQuery,
        SearchRoutinesQueryVariables
      >({
        query: SearchRoutinesDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchRoutines: fallbackSearchRoutines,
        },
      });
    })().catch(error => {
      console.error(
        "failed to simulate searched routines from local db",
        error
      );
    });

    return () => {
      cancelled = true;
    };
  }, [queryResult.client, queryResult.error, queryResult.variables, variables]);

  const fetchMoreWithFallback = (async fetchMoreOptions => {
    try {
      const fetchResult = await queryResult.fetchMore(fetchMoreOptions);
      syncWithSignatureGuard(fetchResult.data as SearchRoutinesQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const fallbackVariables = fetchMoreOptions.variables as
        | SearchRoutinesQueryVariables
        | undefined;
      if (fallbackVariables?.input === undefined) throw error;

      const fallbackSearchRoutines =
        await RoutineLocalSimulator.simulateSearchRoutines(
          fallbackVariables.input
        );
      queryResult.client.writeQuery<
        SearchRoutinesQuery,
        SearchRoutinesQueryVariables
      >({
        query: SearchRoutinesDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchRoutines: fallbackSearchRoutines,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchRoutines: fallbackSearchRoutines,
        },
      } as any;
    }
  }) as typeof queryResult.fetchMore;

  return useMemo(
    () => ({
      ...queryResult,
      fetchMore: fetchMoreWithFallback,
    }),
    [fetchMoreWithFallback, queryResult]
  );
};
