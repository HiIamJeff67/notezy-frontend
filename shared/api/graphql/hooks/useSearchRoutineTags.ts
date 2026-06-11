import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  SupportedIcon as GraphQLSupportedIcon,
  SearchRoutineTagsDocument,
  type SearchRoutineTagsQuery,
  type SearchRoutineTagsQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { SupportedIcon } from "@shared/api/interfaces/enums";
import { RoutineTagLocalSimulator } from "@shared/api/local/simulators/routineTag.simulator";
import { RoutineTagLocalSynchronizer } from "@shared/api/local/synchronizers/routineTag.synchronizer";
import { useEffect, useMemo, useRef } from "react";
import { isNetworkFallbackError } from "./error";

const alignSearchedRoutineTags = (
  data?: SearchRoutineTagsQuery
): Array<{
  id: string;
  name: string;
  color: string;
  icon: SupportedIcon | null;
  updatedAt: Date;
  createdAt: Date;
}> =>
  data?.searchRoutineTags.searchEdges.map(edge => {
    const node = edge.node as unknown as {
      id: string;
      name: string;
      color: string;
      icon: GraphQLSupportedIcon | null;
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
      color: node.color,
      icon,
      updatedAt: new Date(node.updatedAt ?? 0),
      createdAt: new Date(node.createdAt ?? 0),
    };
  }) ?? [];

export const useSearchRoutineTagsLazyQuery = (
  options?: useLazyQuery.Options<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >
): useLazyQuery.ResultTuple<
  SearchRoutineTagsQuery,
  SearchRoutineTagsQueryVariables
> => {
  const [execute, result] = useLazyQuery<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >(SearchRoutineTagsDocument, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchRoutineTagsQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchRoutineTags.totalCount ?? 0,
      endCursor: data?.searchRoutineTags.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutineTags.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            updatedAt: Date | string | number;
          };
          return {
            cursor: edge.encodedSearchCursor,
            id: node.id,
            updatedAt: new Date(node.updatedAt ?? 0).getTime(),
          };
        }) ?? [],
    });
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;

    void RoutineTagLocalSynchronizer.syncSearchRoutineTags(
      alignSearchedRoutineTags(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched routine tags to local db",
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
            | SearchRoutineTagsQueryVariables
            | undefined) ??
          (result.variables as SearchRoutineTagsQueryVariables | undefined);
        if (variables?.input === undefined) throw error;

        const fallbackSearchRoutineTags =
          await RoutineTagLocalSimulator.simulateSearchRoutineTags(
            variables.input
          );
        result.client.writeQuery<
          SearchRoutineTagsQuery,
          SearchRoutineTagsQueryVariables
        >({
          query: SearchRoutineTagsDocument,
          variables,
          data: {
            __typename: "Query",
            searchRoutineTags: fallbackSearchRoutineTags,
          },
        });
        return {
          data: {
            __typename: "Query",
            searchRoutineTags: fallbackSearchRoutineTags,
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
      syncWithSignatureGuard(fetchResult.data as SearchRoutineTagsQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const variables = fetchMoreOptions.variables as
        | SearchRoutineTagsQueryVariables
        | undefined;
      if (variables?.input === undefined) throw error;

      const fallbackSearchRoutineTags =
        await RoutineTagLocalSimulator.simulateSearchRoutineTags(
          variables.input
        );
      result.client.writeQuery<
        SearchRoutineTagsQuery,
        SearchRoutineTagsQueryVariables
      >({
        query: SearchRoutineTagsDocument,
        variables,
        data: {
          __typename: "Query",
          searchRoutineTags: fallbackSearchRoutineTags,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchRoutineTags: fallbackSearchRoutineTags,
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

export const useSearchRoutineTagsQuery = (
  variables: SearchRoutineTagsQueryVariables,
  options?: useQuery.Options<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >
) => {
  const queryResult = useQuery<
    SearchRoutineTagsQuery,
    SearchRoutineTagsQueryVariables
  >(SearchRoutineTagsDocument, {
    variables,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");
  const latestFallbackKeyRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchRoutineTagsQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchRoutineTags.totalCount ?? 0,
      endCursor: data?.searchRoutineTags.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRoutineTags.searchEdges.map(edge => {
          const node = edge.node as unknown as {
            id: string;
            updatedAt: Date | string | number;
          };
          return {
            cursor: edge.encodedSearchCursor,
            id: node.id,
            updatedAt: new Date(node.updatedAt ?? 0).getTime(),
          };
        }) ?? [],
    });
    if (nextSignature === latestSyncedSignatureRef.current) return;
    latestSyncedSignatureRef.current = nextSignature;

    void RoutineTagLocalSynchronizer.syncSearchRoutineTags(
      alignSearchedRoutineTags(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched routine tags to local db",
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
      (queryResult.variables as SearchRoutineTagsQueryVariables | undefined) ??
      variables;
    if (fallbackVariables?.input === undefined) return;

    const fallbackKey = JSON.stringify(fallbackVariables.input);
    if (fallbackKey === latestFallbackKeyRef.current) return;
    latestFallbackKeyRef.current = fallbackKey;

    let cancelled = false;
    void (async () => {
      const fallbackSearchRoutineTags =
        await RoutineTagLocalSimulator.simulateSearchRoutineTags(
          fallbackVariables.input
        );
      if (cancelled) return;
      queryResult.client.writeQuery<
        SearchRoutineTagsQuery,
        SearchRoutineTagsQueryVariables
      >({
        query: SearchRoutineTagsDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchRoutineTags: fallbackSearchRoutineTags,
        },
      });
    })().catch(error => {
      console.error(
        "failed to simulate searched routine tags from local db",
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
      syncWithSignatureGuard(fetchResult.data as SearchRoutineTagsQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const fallbackVariables = fetchMoreOptions.variables as
        | SearchRoutineTagsQueryVariables
        | undefined;
      if (fallbackVariables?.input === undefined) throw error;

      const fallbackSearchRoutineTags =
        await RoutineTagLocalSimulator.simulateSearchRoutineTags(
          fallbackVariables.input
        );
      queryResult.client.writeQuery<
        SearchRoutineTagsQuery,
        SearchRoutineTagsQueryVariables
      >({
        query: SearchRoutineTagsDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchRoutineTags: fallbackSearchRoutineTags,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchRoutineTags: fallbackSearchRoutineTags,
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
