import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import {
  mutationFnCreateRootShelf,
  mutationFnCreateRootShelves,
  mutationFnDeleteMyRootShelfById,
  mutationFnDeleteMyRootShelvesByIds,
  mutationFnRestoreMyRootShelfById,
  mutationFnRestoreMyRootShelvesByIds,
  mutationFnUpdateMyRootShelfById,
  mutationFnUpdateMyRootShelvesByIds,
  queryFnGetMyRootShelfById,
} from "@shared/api/functions/rootShelf.function";
import type {
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { getQueryClient } from "@shared/api/queryClient";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useGetMyRootShelfById = (
  hookRequest?: GetMyRootShelfByIdRequest,
  options?: UseQueryOptions
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.rootShelf.oneById(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyRootShelfById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyRootShelfByIdRequest
  ): Promise<GetMyRootShelfByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.rootShelf.oneById(
        callbackRequest.param.rootShelfId as UUID
      ),
      queryFn: async () => await queryFnGetMyRootShelfById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_ROOT_SHELF_BY_ID_HOOK" as const,
  };
};

export const useCreateRootShelf = () => {
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRootShelf,
    onSuccess: (response, variables) => {
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdge = {
              __typename: "SearchRootShelfEdge",
              node: {
                __typename: "PrivateRootShelf",
                id: response.data.id,
                name: variables.body.name,
                subShelfCount: 0,
                itemCount: 0,
                lastAnalyzedAt: response.data.lastAnalyzedAt,
                updatedAt: response.data.createdAt,
                createdAt: response.data.createdAt,
              },
            };

            const updatedEdges = [
              newEdge,
              ...existingSearchRootShelves.searchEdges,
            ];

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "CREATE_ROOT_SHELF_HOOK" as const,
  };
};

export const useCreateRootShelves = () => {
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRootShelves,
    onSuccess: (response, variables) => {
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdges = [];
            // since the response and the variables(request body) are aligned in the backend,
            // we can just try to iterate through them
            for (
              let i = 0;
              i < response.data.ids.length &&
              i < variables.body.createdRootShelves.length;
              i++
            ) {
              const newEdge = {
                __typename: "SearchRootShelfEdge",
                node: {
                  __typename: "PrivateRootShelf",
                  id: response.data.ids[i],
                  name: variables.body.createdRootShelves[i].name,
                  subShelfCount: 0,
                  itemCount: 0,
                  lastAnalyzedAt: response.data.lastAnalyzedAt,
                  updatedAt: response.data.createdAt,
                  createdAt: response.data.createdAt,
                },
              };
              newEdges.push(newEdge);
            }

            const updatedEdges = [
              ...newEdges,
              ...existingSearchRootShelves.searchEdges,
            ];

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "CREATE_ROOT_SHELVES_HOOK" as const,
  };
};

export const useUpdateMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRootShelfById,
    onSuccess: (response, variables) => {
      const rootShelfId = variables.body.rootShelfId as UUID;
      queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(rootShelfId),
      });
      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: "PrivateRootShelf",
          id: rootShelfId,
        }),
        fields: {
          ...(variables.body.values.name && {
            name: () => variables.body.values.name,
          }),
        },
      });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_ROOT_SHELF_BY_ID_HOOK" as const,
  };
};
export const useUpdateMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRootShelvesByIds,
    onSuccess: (_, variables) => {
      for (const updatedRootShelf of variables.body.updatedRootShelves) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.rootShelf.oneById(
            updatedRootShelf.rootShelfId as UUID
          ),
        });
        apolloClient.cache.modify({
          id: apolloClient.cache.identify({
            __typename: "PrivateRootShelf",
            id: updatedRootShelf.rootShelfId,
          }),
          fields: {
            ...(updatedRootShelf.values.name && {
              name: () => updatedRootShelf.values.name,
            }),
          },
        });
      }
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_ROOT_SHELVES_BY_IDS_HOOK" as const,
  };
};

export const useRestoreMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyRootShelfById,
    onSuccess: (response, variables) => {
      const rootShelfId = variables.body.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const restoredEdge = {
              __typename: "SearchRootShelfEdge",
              node: {
                __typename: "PrivateRootShelf",
                id: response.data.id,
                name: response.data.name,
                subShelfCount: response.data.subShelfCount,
                itemCount: response.data.itemCount,
                lastAnalyzedAt: response.data.lastAnalyzedAt,
                updatedAt: response.data.updatedAt,
                createdAt: response.data.createdAt,
              },
            };

            if (
              existingSearchRootShelves.searchEdges.some(
                (edge: any) => readField("id", edge.node) === response.data.id
              )
            )
              return existingSearchRootShelves;

            const updatedEdges = [
              restoredEdge,
              ...existingSearchRootShelves.searchEdges,
            ];

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESTORE_MY_ROOT_SHELF_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyRootShelvesByIds,
    onSuccess: (response, variables) => {
      const rootShelfIds = (variables.body.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdges = response.data
              .map(shelf => ({
                __typename: "SearchRootShelfEdge",
                node: {
                  __typename: "PrivateRootShelf",
                  id: shelf.id,
                  name: shelf.name,
                  subShelfCount: shelf.subShelfCount,
                  itemCount: shelf.itemCount,
                  lastAnalyzedAt: shelf.lastAnalyzedAt,
                  updatedAt: shelf.updatedAt,
                  createdAt: shelf.createdAt,
                },
              }))
              .filter(edge => {
                const exists = existingSearchRootShelves.searchEdges.some(
                  (existingEdge: any) =>
                    readField("id", existingEdge.node) === edge.node.id
                );
                return !exists;
              });

            if (newEdges.length === 0) return existingSearchRootShelves;

            return {
              ...existingSearchRootShelves,
              searchEdges: [
                ...newEdges,
                ...existingSearchRootShelves.searchEdges,
              ],
            };
          },
        },
      });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESTORE_MY_ROOT_SHELVES_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyRootShelfById,
    onSuccess: (_, variables) => {
      const rootShelfId = variables.body.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const updatedEdges = existingSearchRootShelves.searchEdges.filter(
              (edge: any) => readField("id", edge.node) !== rootShelfId
            );

            return {
              ...existingSearchRootShelves,
              searchEdges: updatedEdges,
            };
          },
        },
      });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_ROOT_SHELF_BY_ID_HOOK" as const,
  };
};

export const useDeleteMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyRootShelvesByIds,
    onSuccess: (_, variables) => {
      const rootShelfIds = (variables.body.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_ROOT_SHELVES_BY_IDS_HOOK" as const,
  };
};
