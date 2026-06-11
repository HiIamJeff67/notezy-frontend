import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SupportedIcon as GraphQLSupportedIcon,
  SearchStationsDocument,
  type SearchStationsQuery,
  type SearchStationsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import { StationLocalSimulator } from "@shared/api/local/simulators/station.simulator";
import { StationLocalSynchronizer } from "@shared/api/local/synchronizers/station.synchronizer";
import { useEffect, useMemo, useRef } from "react";
import { isNetworkFallbackError } from "./error";

const alignSearchedStations = (
  data?: SearchStationsQuery
): Array<{
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
}> =>
  data?.searchStations.searchEdges.map(edge => {
    const node = edge.node as unknown as {
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

    const icon = (() => {
      switch (node.icon) {
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
      name: node.name,
      description: node.description,
      icon,
      headerBackgroundURL: node.headerBackgroundURL,
      permission: node.permission as unknown as AccessControlPermission,
      routineCount: node.routineCount,
      deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt ?? 0),
      updatedAt: new Date(node.updatedAt ?? 0),
      createdAt: new Date(node.createdAt ?? 0),
    };
  }) ?? [];

export const useSearchStationsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchStationsQuery,
    SearchStationsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchStationsQuery,
  SearchStationsQueryVariables
> => {
  const [execute, result] = useLazyQuery<
    SearchStationsQuery,
    SearchStationsQueryVariables
  >(SearchStationsDocument, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchStationsQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchStations.totalCount ?? 0,
      endCursor: data?.searchStations.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchStations.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            permission: AccessControlPermission;
            updatedAt: Date | string | number;
          };
          return {
            cursor: edge.encodedSearchCursor,
            id: node.id,
            permission: node.permission,
            updatedAt: new Date(node.updatedAt ?? 0).getTime(),
          };
        }) ?? [],
    });
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;

    void StationLocalSynchronizer.syncSearchStations(
      alignSearchedStations(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched stations to local db",
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
            | SearchStationsQueryVariables
            | undefined) ??
          (result.variables as SearchStationsQueryVariables | undefined);
        if (variables?.input === undefined) throw error;

        const fallbackSearchStations =
          await StationLocalSimulator.simulateSearchStations(variables.input);
        result.client.writeQuery<
          SearchStationsQuery,
          SearchStationsQueryVariables
        >({
          query: SearchStationsDocument,
          variables,
          data: {
            __typename: "Query",
            searchStations: fallbackSearchStations,
          },
        });
        return {
          data: {
            __typename: "Query",
            searchStations: fallbackSearchStations,
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
      syncWithSignatureGuard(fetchResult.data as SearchStationsQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const variables = fetchMoreOptions.variables as
        | SearchStationsQueryVariables
        | undefined;
      if (variables?.input === undefined) throw error;

      const fallbackSearchStations =
        await StationLocalSimulator.simulateSearchStations(variables.input);
      result.client.writeQuery<
        SearchStationsQuery,
        SearchStationsQueryVariables
      >({
        query: SearchStationsDocument,
        variables,
        data: {
          __typename: "Query",
          searchStations: fallbackSearchStations,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchStations: fallbackSearchStations,
        },
      } as any;
    }
  }) as typeof result.fetchMore;

  const wrappedResult = useMemo(
    () => ({
      ...result,
      fetchMore: fetchMoreWithFallback,
    }),
    [fetchMoreWithFallback, result]
  );

  return [executeWithSync, wrappedResult];
};

export const useSearchStationsQuery = (
  variables: SearchStationsQueryVariables,
  options?: useQuery.Options<SearchStationsQuery, SearchStationsQueryVariables>
) => {
  const queryResult = useQuery<
    SearchStationsQuery,
    SearchStationsQueryVariables
  >(SearchStationsDocument, {
    variables,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");
  const latestFallbackKeyRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchStationsQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchStations.totalCount ?? 0,
      endCursor: data?.searchStations.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchStations.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            permission: AccessControlPermission;
            updatedAt: Date | string | number;
          };
          return {
            cursor: edge.encodedSearchCursor,
            id: node.id,
            permission: node.permission,
            updatedAt: new Date(node.updatedAt ?? 0).getTime(),
          };
        }) ?? [],
    });
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;

    void StationLocalSynchronizer.syncSearchStations(
      alignSearchedStations(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched stations to local db",
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
      (queryResult.variables as SearchStationsQueryVariables | undefined) ??
      variables;
    if (fallbackVariables?.input === undefined) return;

    const fallbackKey = JSON.stringify(fallbackVariables.input);
    if (fallbackKey === latestFallbackKeyRef.current) return;
    latestFallbackKeyRef.current = fallbackKey;

    let cancelled = false;
    void (async () => {
      const fallbackSearchStations =
        await StationLocalSimulator.simulateSearchStations(
          fallbackVariables.input
        );
      if (cancelled) return;
      queryResult.client.writeQuery<
        SearchStationsQuery,
        SearchStationsQueryVariables
      >({
        query: SearchStationsDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchStations: fallbackSearchStations,
        },
      });
    })().catch(error => {
      console.error(
        "failed to simulate searched stations from local db",
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
      syncWithSignatureGuard(fetchResult.data as SearchStationsQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const fallbackVariables = fetchMoreOptions.variables as
        | SearchStationsQueryVariables
        | undefined;
      if (fallbackVariables?.input === undefined) throw error;

      const fallbackSearchStations =
        await StationLocalSimulator.simulateSearchStations(
          fallbackVariables.input
        );
      queryResult.client.writeQuery<
        SearchStationsQuery,
        SearchStationsQueryVariables
      >({
        query: SearchStationsDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchStations: fallbackSearchStations,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchStations: fallbackSearchStations,
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
