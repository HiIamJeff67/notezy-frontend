import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetAllMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@shared/api/functions/blockPack.function";
import {
  CreateBlockPackRequest,
  CreateBlockPackRequestSchema,
  CreateBlockPackResponse,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdRequestSchema,
  DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsRequestSchema,
  DeleteMyBlockPacksByIdsResponse,
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdRequestSchema,
  MoveMyBlockPackByIdResponse,
  MoveMyBlockPacksByIdsRequest,
  MoveMyBlockPacksByIdsRequestSchema,
  MoveMyBlockPacksByIdsResponse,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdRequestSchema,
  RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsRequestSchema,
  RestoreMyBlockPacksByIdsResponse,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdRequestSchema,
  UpdateMyBlockPackByIdResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  CreateBlockPack,
  DeleteMyBlockPackById,
  DeleteMyBlockPacksByIds,
  MoveMyBlockPackById,
  MoveMyBlockPacksByIds,
  RestoreMyBlockPackById,
  RestoreMyBlockPacksByIds,
  UpdateMyBlockPackById,
} from "@shared/api/invokers/blockPack.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useGetMyBlockPackById = (
  hookRequest?: GetMyBlockPackByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.myOneById(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyBlockPackById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPackByIdRequest
  ): Promise<GetMyBlockPackByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.myOneById(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () => await queryFnGetMyBlockPackById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockPackAndItsParentById = (
  hookRequest?: GetMyBlockPackAndItsParentByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.myOneById(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPackAndItsParentById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.myOneById(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPackAndItsParentById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_PACK_AND_ITS_PARENT_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockPacksByParentSubShelfId = (
  hookRequest?: GetMyBlockPacksByParentSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.myManyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPacksByParentSubShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.myManyByParentSubShelfId(
        callbackRequest.param.parentSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPacksByParentSubShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_PACKS_BY_PARENT_SUB_SHELF_ID" as const,
  };
};

export const useGetAllMyBlockPacksByRootShelfId = (
  hookRequest?: GetAllMyBlockPacksByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.myManyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetAllMyBlockPacksByRootShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.myManyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMyBlockPacksByRootShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_BLOCK_PACKS_BY_ROOT_SHELF_ID" as const,
  };
};

export const useCreateBlockPack = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: CreateBlockPackRequest
    ): Promise<CreateBlockPackResponse> => {
      const validatedRequest = CreateBlockPackRequestSchema.parse(request);
      return await CreateBlockPack(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
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
    name: "CREATE_BLOCK_PACK_HOOK" as const,
  };
};

export const useUpdateMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMyBlockPackByIdRequest
    ): Promise<UpdateMyBlockPackByIdResponse> => {
      const validatedRequest =
        UpdateMyBlockPackByIdRequestSchema.parse(request);
      return await UpdateMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
              }
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
    name: "UPDATE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useMoveMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMyBlockPackByIdRequest
    ): Promise<MoveMyBlockPackByIdResponse> => {
      const validatedRequest = MoveMyBlockPackByIdRequestSchema.parse(request);
      return await MoveMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId;
      const destinationParentSubShelfId =
        variables.body.destinationParentSubShelfId;
      const sourceParentSubShelfId = variables.affected.sourceParentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelfId":
              if (
                k[1] === "myOneById" &&
                (sourceParentSubShelfId === k[2] ||
                  destinationParentSubShelfId === k[2])
              )
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (
                    sourceParentSubShelfId === k[2] ||
                    destinationParentSubShelfId === k[2]
                  )
                    return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
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
    name: "MOVE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useMoveMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMyBlockPacksByIdsRequest
    ): Promise<MoveMyBlockPacksByIdsResponse> => {
      const validatedRequest =
        MoveMyBlockPacksByIdsRequestSchema.parse(request);
      return await MoveMyBlockPacksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIdsSet = new Set(
        (variables.body.blockPackIds || []).filter(Boolean) as UUID[]
      );
      const destinationParentSubShelfId =
        variables.body.destinationParentSubShelfId;
      const sourceParentSubShelfIdsSet = new Set(
        (variables.affected.sourceParentSubShelfIds || []).filter(
          Boolean
        ) as UUID[]
      );
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelfId":
              if (
                k[1] === "myOneById" &&
                (sourceParentSubShelfIdsSet.has(k[2]) ||
                  destinationParentSubShelfId === k[2])
              )
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackIdsSet.has(k[2])) return true;
                case "myManyByParentSubShelfId":
                  if (
                    sourceParentSubShelfIdsSet.has(k[2]) ||
                    destinationParentSubShelfId === k[2]
                  )
                    return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
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
    name: "MOVE_MY_BLOCK_PACKS_BY_IDS_HOOK" as const,
  };
};

export const useRestoreMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockPackByIdRequest
    ): Promise<RestoreMyBlockPackByIdResponse> => {
      const validatedRequest =
        RestoreMyBlockPackByIdRequestSchema.parse(request);
      return await RestoreMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelfId":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
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
    name: "RESTORE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockPacksByIdsRequest
    ): Promise<RestoreMyBlockPacksByIdsResponse> => {
      const validatedRequest =
        RestoreMyBlockPacksByIdsRequestSchema.parse(request);
      return await RestoreMyBlockPacksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIdsSet = new Set(
        (variables.body.blockPackIds || []).filter(Boolean) as UUID[]
      );
      const parentSubShelfIdsSet = new Set(
        (variables.affected.parentSubShelfIds || []).filter(Boolean) as UUID[]
      );
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelfId":
              if (k[1] === "myOneById" && parentSubShelfIdsSet.has(k[2]))
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackIdsSet.has(k[2])) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfIdsSet.has(k[2])) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
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
    name: "RESTORE_MY_BLOCK_PACKS_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockPackByIdRequest
    ): Promise<DeleteMyBlockPackByIdResponse> => {
      const validatedRequest =
        DeleteMyBlockPackByIdRequestSchema.parse(request);
      return await DeleteMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelfId":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
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
    name: "DELETE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useDeleteMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockPacksByIdsRequest
    ): Promise<DeleteMyBlockPacksByIdsResponse> => {
      const validatedRequest =
        DeleteMyBlockPacksByIdsRequestSchema.parse(request);
      return await DeleteMyBlockPacksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIdsSet = new Set(
        (variables.body.blockPackIds || []).filter(Boolean) as UUID[]
      );
      const parentSubShelfIdsSet = new Set(
        (variables.affected.parentSubShelfIds || []).filter(Boolean) as UUID[]
      );
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelfId":
              if (k[1] === "myOneById" && parentSubShelfIdsSet.has(k[2]))
                return true;
            case "blockPack":
              switch (k[1]) {
                case "myOneById":
                  if (blockPackIdsSet.has(k[2])) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfIdsSet.has(k[2])) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
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
    name: "DELETE_MY_BLOCK_PACKS_BY_IDS_HOOK" as const,
  };
};
