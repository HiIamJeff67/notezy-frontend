import { useLazyQuery, useQuery } from "@apollo/client/react";
import {
  AccessControlPermission,
  SearchRootShelvesDocument,
  type SearchRootShelvesQuery,
  type SearchRootShelvesQueryVariables,
} from "@shared/api/graphql/generated/graphql";
import { RootShelfLocalSimulator } from "@shared/api/local/simulators/rootShelf.simulator";
import { RootShelfLocalSynchronizer } from "@shared/api/local/synchronizers/rootShelf.synchronizer";
import { useEffect, useMemo, useRef } from "react";
import { isNetworkFallbackError } from "./error";

type SearchRootShelvesLazyQueryOptions = useLazyQuery.Options<
  SearchRootShelvesQuery,
  SearchRootShelvesQueryVariables
>;

type SearchRootShelvesLazyQueryResultTuple = useLazyQuery.ResultTuple<
  SearchRootShelvesQuery,
  SearchRootShelvesQueryVariables
>;

type SearchRootShelvesQueryOptions = useQuery.Options<
  SearchRootShelvesQuery,
  SearchRootShelvesQueryVariables
>;

const alignSearchedRootShelves = (
  data?: SearchRootShelvesQuery
): {
  id: string;
  name: string;
  subShelfCount: number;
  itemCount: number;
  lastAnalyzedAt: Date;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  ownerPublicId: string;
  permission: AccessControlPermission;
}[] =>
  data?.searchRootShelves.searchEdges.map(edge => {
    const node = edge.node as unknown as {
      id: string;
      name: string;
      subShelfCount: number;
      itemCount: number;
      lastAnalyzedAt: Date | string | number;
      deletedAt: Date | string | number | null;
      updatedAt: Date | string | number;
      createdAt: Date | string | number;
      owner: Array<{ publicId: string }> | { publicId: string };
      permission: AccessControlPermission;
    };
    const ownerPublicId = Array.isArray(node.owner)
      ? (node.owner[0]?.publicId ?? "")
      : (node.owner?.publicId ?? "");

    return {
      id: node.id,
      name: node.name,
      subShelfCount: node.subShelfCount,
      itemCount: node.itemCount,
      lastAnalyzedAt: new Date(node.lastAnalyzedAt ?? 0),
      deletedAt: node.deletedAt === null ? null : new Date(node.deletedAt ?? 0),
      updatedAt: new Date(node.updatedAt ?? 0),
      createdAt: new Date(node.createdAt ?? 0),
      ownerPublicId,
      permission: node.permission,
    };
  }) ?? [];

export const useSearchRootShelvesLazyQuery = (
  options?: SearchRootShelvesLazyQueryOptions
): SearchRootShelvesLazyQueryResultTuple => {
  const [execute, result] = useLazyQuery<
    SearchRootShelvesQuery,
    SearchRootShelvesQueryVariables
  >(SearchRootShelvesDocument, {
    notifyOnNetworkStatusChange: true,
    ...options,
  });
  const latestSyncedSignatureRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchRootShelvesQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchRootShelves.totalCount ?? 0,
      endCursor: data?.searchRootShelves.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRootShelves.searchEdges.map(edge => {
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

    void RootShelfLocalSynchronizer.syncSearchRootShelves(
      alignSearchedRootShelves(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched root shelves to local db",
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
            | SearchRootShelvesQueryVariables
            | undefined) ??
          (result.variables as SearchRootShelvesQueryVariables | undefined);
        if (variables?.input === undefined) throw error;

        const fallbackSearchRootShelves =
          await RootShelfLocalSimulator.simulateSearchRootShelves(
            variables.input
          );
        result.client.writeQuery<
          SearchRootShelvesQuery,
          SearchRootShelvesQueryVariables
        >({
          query: SearchRootShelvesDocument,
          variables,
          data: {
            __typename: "Query",
            searchRootShelves: fallbackSearchRootShelves,
          },
        });
        return {
          data: {
            __typename: "Query",
            searchRootShelves: fallbackSearchRootShelves,
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
      syncWithSignatureGuard(fetchResult.data as SearchRootShelvesQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const variables = fetchMoreOptions.variables as
        | SearchRootShelvesQueryVariables
        | undefined;
      if (variables?.input === undefined) throw error;

      const fallbackSearchRootShelves =
        await RootShelfLocalSimulator.simulateSearchRootShelves(
          variables.input
        );
      result.client.writeQuery<
        SearchRootShelvesQuery,
        SearchRootShelvesQueryVariables
      >({
        query: SearchRootShelvesDocument,
        variables,
        data: {
          __typename: "Query",
          searchRootShelves: fallbackSearchRootShelves,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchRootShelves: fallbackSearchRootShelves,
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

export const useSearchShelvesQuery = (
  variables: SearchRootShelvesQueryVariables,
  options?: SearchRootShelvesQueryOptions
) => {
  const queryResult = useQuery<
    SearchRootShelvesQuery,
    SearchRootShelvesQueryVariables
  >(SearchRootShelvesDocument, {
    variables,
    ...options,
  });

  const latestSyncedSignatureRef = useRef<string>("");
  const latestFallbackKeyRef = useRef<string>("");

  const syncWithSignatureGuard = (data?: SearchRootShelvesQuery) => {
    const nextSignature = JSON.stringify({
      totalCount: data?.searchRootShelves.totalCount ?? 0,
      endCursor: data?.searchRootShelves.searchPageInfo.endEncodedSearchCursor,
      edges:
        data?.searchRootShelves.searchEdges.map(edge => {
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

    void RootShelfLocalSynchronizer.syncSearchRootShelves(
      alignSearchedRootShelves(data)
    ).catch(error =>
      console.error(
        "failed to synchronize searched root shelves to local db",
        error
      )
    );
  };

  // synchronize the result to local database
  useEffect(() => {
    syncWithSignatureGuard(queryResult.data);
  }, [queryResult.data]);

  // simulate the result while some acceptable error happened
  useEffect(() => {
    if (queryResult.error === undefined) return;
    if (!isNetworkFallbackError(queryResult.error)) return;

    const fallbackVariables =
      (queryResult.variables as SearchRootShelvesQueryVariables | undefined) ??
      variables;
    if (fallbackVariables?.input === undefined) return;

    const fallbackKey = JSON.stringify(fallbackVariables.input);
    if (fallbackKey === latestFallbackKeyRef.current) return;
    latestFallbackKeyRef.current = fallbackKey;

    let cancelled = false;
    void (async () => {
      const fallbackSearchRootShelves =
        await RootShelfLocalSimulator.simulateSearchRootShelves(
          fallbackVariables.input
        );
      if (cancelled) return;
      queryResult.client.writeQuery<
        SearchRootShelvesQuery,
        SearchRootShelvesQueryVariables
      >({
        query: SearchRootShelvesDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchRootShelves: fallbackSearchRootShelves,
        },
      });
    })().catch(error => {
      console.error(
        "failed to simulate searched root shelves from local db",
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
      syncWithSignatureGuard(fetchResult.data as SearchRootShelvesQuery);
      return fetchResult;
    } catch (error) {
      if (!isNetworkFallbackError(error)) throw error;

      const fallbackVariables = fetchMoreOptions.variables as
        | SearchRootShelvesQueryVariables
        | undefined;
      if (fallbackVariables?.input === undefined) throw error;

      const fallbackSearchRootShelves =
        await RootShelfLocalSimulator.simulateSearchRootShelves(
          fallbackVariables.input
        );
      queryResult.client.writeQuery<
        SearchRootShelvesQuery,
        SearchRootShelvesQueryVariables
      >({
        query: SearchRootShelvesDocument,
        variables: fallbackVariables,
        data: {
          __typename: "Query",
          searchRootShelves: fallbackSearchRootShelves,
        },
      });
      return {
        data: {
          __typename: "Query",
          searchRootShelves: fallbackSearchRootShelves,
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
