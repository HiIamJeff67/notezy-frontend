import { LocalStorageManipulator } from "@/util/localStorageManipulator";
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
  DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdRequestSchema,
  DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequestSchema,
  RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdRequestSchema,
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
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useGetMyRootShelfById = (
  hookRequest?: GetMyRootShelfByIdRequest,
  options?: UseQueryOptions
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.rootShelf.myOneById(
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
      queryKey: queryKeys.rootShelf.myOneById(
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
    mutationFn: async (request: CreateRootShelfRequest) => {
      const validatedRequest = CreateRootShelfRequestSchema.parse(request);
      return await CreateRootShelf(validatedRequest);
    },
    onSuccess: (response, _) => {
      apolloClient.cache.modify({
        fields: {
          searchRootShelves(existingSearchRootShelves, { readField }) {
            if (!existingSearchRootShelves) return existingSearchRootShelves;

            const newEdge = {
              __typename: "SearchRootShelfEdge",
              node: {
                __typename: "PrivateRootShelf",
                id: response.data.id,
                name: name,
                totalShelfNodes: 0,
                totalMaterials: 0,
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
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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

  const mutation = useMutation({
    mutationFn: async (request: UpdateMyRootShelfByIdRequest) => {
      const validatedRequest =
        UpdateMyRootShelfByIdRequestSchema.parse(request);
      return await UpdateMyRootShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.rootShelf.myOneById(
          variables.body.rootShelfId as UUID
        ),
      });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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

  const mutation = useMutation({
    mutationFn: async (request: RestoreMyRootShelfByIdRequest) => {
      const validatedRequest =
        RestoreMyRootShelfByIdRequestSchema.parse(request);
      return await RestoreMyRootShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const rootShelfId = variables.body.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              if (k[1] === "myManyByRootShelfId" && rootShelfId === k[2])
                return true;
            case "material":
              if (k[1] === "myManyByRootShelfId" && rootShelfId === k[2])
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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

  const mutation = useMutation({
    mutationFn: async (request: RestoreMyRootShelvesByIdsRequest) => {
      const validatedRequest =
        RestoreMyRootShelvesByIdsRequestSchema.parse(request);
      return await RestoreMyRootShelvesByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const rootShelfIdsSet = new Set(
        (variables.body.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelf":
              if (k[1] === "myManyByRootShelfId" && rootShelfIdsSet.has(k[2]))
                return true;
            case "material":
              if (k[1] === "myManyByRootShelfId" && rootShelfIdsSet.has(k[2]))
                return true;
          }

          return false;
        },
      });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
  });

  return {
    ...mutation,
    name: "RESTORE_MY_ROOT_SHELVES_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMyRootShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMyRootShelfByIdRequest) => {
      const validatedRequest =
        DeleteMyRootShelfByIdRequestSchema.parse(request);
      return await DeleteMyRootShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const rootShelfId = variables.body.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              if (k[1] === "myManyByRootShelfId" && rootShelfId === k[2])
                return true;
            case "material":
              if (k[1] === "myManyByRootShelfId" && rootShelfId === k[2])
                return true;
          }

          return false;
        },
        refetchType: "active",
      });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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
    mutationFn: async (request: DeleteMyRootShelvesByIdsRequest) => {
      const validatedRequest =
        DeleteMyRootShelvesByIdsRequestSchema.parse(request);
      return await DeleteMyRootShelvesByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const rootShelfIdsSet = new Set(
        (variables.body.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelf":
              if (k[1] === "myManyByRootShelfId" && rootShelfIdsSet.has(k[2]))
                return true;
            case "material":
              if (k[1] === "myManyByRootShelfId" && rootShelfIdsSet.has(k[2]))
                return true;
          }

          return false;
        },
      });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_ROOT_SHELVES_BY_IDS_HOOK" as const,
  };
};
