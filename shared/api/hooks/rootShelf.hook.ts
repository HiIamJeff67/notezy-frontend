import { useApolloClient } from "@apollo/client/react";
import { NotezyAPIError } from "@shared/api/exceptions";
import { queryFnGetMyRootShelfById } from "@shared/api/functions/rootShelf.function";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  CreateRootShelfRequest,
  CreateRootShelfRequestSchema,
  CreateRootShelfResponse,
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdRequestSchema,
  DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  DeleteMyRootShelvesByIdsResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequestSchema,
  RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  RestoreMyRootShelvesByIdsResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdRequestSchema,
  UpdateMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  CreateRootShelf,
  DeleteMyRootShelfById,
  DeleteMyRootShelvesByIds,
  RestoreMyRootShelfById,
  RestoreMyRootShelvesByIds,
  UpdateMyRootShelfById,
} from "@shared/api/invokers/rootShelf.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  QueryKey,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

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
    mutationFn: async (
      request: CreateRootShelfRequest
    ): Promise<CreateRootShelfResponse> => {
      const validatedRequest = CreateRootShelfRequestSchema.parse(request);
      return await CreateRootShelf(validatedRequest);
    },
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
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "CREATE_ROOT_SHELF_HOOK" as const,
  };
};

export const useUpdateMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMyRootShelfByIdRequest
    ): Promise<UpdateMyRootShelfByIdResponse> => {
      const validatedRequest =
        UpdateMyRootShelfByIdRequestSchema.parse(request);
      return await UpdateMyRootShelfById(validatedRequest);
    },
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

      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_ROOT_SHELF_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyRootShelfByIdRequest
    ): Promise<RestoreMyRootShelfByIdResponse> => {
      const validatedRequest =
        RestoreMyRootShelfByIdRequestSchema.parse(request);
      return await RestoreMyRootShelfById(validatedRequest);
    },
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
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
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
    mutationFn: async (
      request: RestoreMyRootShelvesByIdsRequest
    ): Promise<RestoreMyRootShelvesByIdsResponse> => {
      const validatedRequest =
        RestoreMyRootShelvesByIdsRequestSchema.parse(request);
      return await RestoreMyRootShelvesByIds(validatedRequest);
    },
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
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
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
    mutationFn: async (
      request: DeleteMyRootShelfByIdRequest
    ): Promise<DeleteMyRootShelfByIdResponse> => {
      const validatedRequest =
        DeleteMyRootShelfByIdRequestSchema.parse(request);
      return await DeleteMyRootShelfById(validatedRequest);
    },
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
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
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
    mutationFn: async (
      request: DeleteMyRootShelvesByIdsRequest
    ): Promise<DeleteMyRootShelvesByIdsResponse> => {
      const validatedRequest =
        DeleteMyRootShelvesByIdsRequestSchema.parse(request);
      return await DeleteMyRootShelvesByIds(validatedRequest);
    },
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
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_ROOT_SHELVES_BY_IDS_HOOK" as const,
  };
};
