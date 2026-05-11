import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { RootShelfLocalAdaptor } from "@shared/api/adaptors/rootShelf.adaptor";
import type {
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
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
} from "@shared/api/invokers/rootShelf.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useLanguage, useUser } from "@/hooks";
import { NotezyFetchError } from "../errors/fetch.error";
import { NotezyValidationError } from "../errors/validation.error";
import { ExceptionReasonDictionary, NotezyAPIError } from "../exceptions";
import { FetchClientExceptions } from "../exceptions/client/fetch.exception";
import { ValidationClientException } from "../exceptions/client/validation.exception";

export const useGetMyRootShelfById = (
  hookRequest?: GetMyRootShelfByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRootShelfByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const languageManager = useLanguage();

  const perform = async (
    request?: GetMyRootShelfByIdRequest
  ): Promise<GetMyRootShelfByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      const response = await queryFnGetMyRootShelfById(request);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      RootShelfLocalAdaptor.syncGetMyRootShelfById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingRootShelf =
          await RootShelfLocalAdaptor.simulateGetMyRootShelfById(request);
        toast.error(languageManager.tError(error.getPresentation));
        return {
          success: false,
          data: existingRootShelf ? { ...existingRootShelf } : null,
          exception: error.unWrap,
          embedded: { publicId: existingRootShelf?.ownerPublicId ?? "" },
        } as GetMyRootShelfByIdResponse;
      } else if (error instanceof NotezyValidationError) {
        toast.error(languageManager.tError(error.getPresentation));
        return {
          success: false,
          data: null,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyRootShelfByIdResponse;
      }

      const existingRootShelf =
        await RootShelfLocalAdaptor.simulateGetMyRootShelfById(request);
      return {
        success: false,
        data: existingRootShelf ? { ...existingRootShelf } : null,
        exception: FetchClientExceptions.UndefinedError(),
        embedded: { publicId: existingRootShelf?.ownerPublicId ?? "" },
      } as GetMyRootShelfByIdResponse;
    }
  };

  const query = useQuery<GetMyRootShelfByIdResponse, Error>({
    queryKey: queryKeys.rootShelf.oneById(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyRootShelfByIdRequest
  ): Promise<GetMyRootShelfByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.rootShelf.oneById(
        callbackRequest.param.rootShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateRootShelf = () => {
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRootShelf,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdge = {
              __typename: "SearchRootShelfEdge",
              node: {
                __typename: "PrivateRootShelf",
                id: response.data.id,
                name: request.body.name,
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
      RootShelfLocalAdaptor.syncCreateRootShelf(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalAdaptor.simulateCreateRootShelf(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useCreateRootShelves = () => {
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRootShelves,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdges = [];
            // since the response and the request(request body) are aligned in the backend,
            // we can just try to iterate through them
            for (
              let i = 0;
              i < response.data.ids.length &&
              i < request.body.createdRootShelves.length;
              i++
            ) {
              const newEdge = {
                __typename: "SearchRootShelfEdge",
                node: {
                  __typename: "PrivateRootShelf",
                  id: response.data.ids[i],
                  name: request.body.createdRootShelves[i].name,
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
      RootShelfLocalAdaptor.syncCreateRootShelves(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalAdaptor.simulateCreateRootShelves(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRootShelfById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const rootShelfId = request.body.rootShelfId as UUID;
      queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.oneById(rootShelfId),
      });
      apolloClient.cache.modify({
        id: apolloClient.cache.identify({
          __typename: "PrivateRootShelf",
          id: rootShelfId,
        }),
        fields: {
          ...(request.body.values.name && {
            name: () => request.body.values.name,
          }),
        },
      });
      RootShelfLocalAdaptor.syncUpdateMyRootShelfById(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await RootShelfLocalAdaptor.simulateUpdateMyRootShelfById(request);
            break;
        }
      }
    },
  });

  return mutation;
};
export const useUpdateMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRootShelvesByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      for (const updatedRootShelf of request.body.updatedRootShelves) {
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
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyRootShelfById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const rootShelfId = request.body.rootShelfId as UUID;
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
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyRootShelvesByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const rootShelfIds = (request.body.rootShelfIds || []).filter(
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
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyRootShelfById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyRootShelfById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const rootShelfId = request.body.rootShelfId as UUID;
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
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyRootShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyRootShelvesByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const rootShelfIds = (request.body.rootShelfIds || []).filter(
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
    onError: error => {},
  });

  return mutation;
};
