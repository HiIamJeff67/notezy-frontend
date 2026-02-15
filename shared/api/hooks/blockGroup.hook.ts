import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";
import { NotezyAPIError } from "../exceptions";
import {
  queryFnGetAllMyBlockGroupsByBlockPackId,
  queryFnGetMyBlockGroupAndItsBlocksById,
  queryFnGetMyBlockGroupById,
  queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId,
  queryFnGetMyBlockGroupsByPrevBlockGroupId,
} from "../functions/blockGroup.function";
import {
  DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupByIdRequestSchema,
  DeleteMyBlockGroupByIdResponse,
  DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsRequestSchema,
  DeleteMyBlockGroupsByIdsResponse,
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetAllMyBlockGroupsByBlockPackIdResponse,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdResponse,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupByIdResponse,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
  GetMyBlockGroupsByPrevBlockGroupIdResponse,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema,
  InsertBlockGroupAndItsBlocksByBlockPackIdResponse,
  InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdRequestSchema,
  InsertBlockGroupByBlockPackIdResponse,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  MoveMyBlockGroupsByIdsRequest,
  MoveMyBlockGroupsByIdsRequestSchema,
  MoveMyBlockGroupsByIdsResponse,
  RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupByIdRequestSchema,
  RestoreMyBlockGroupByIdResponse,
  RestoreMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupsByIdsRequestSchema,
  RestoreMyBlockGroupsByIdsResponse,
} from "../interfaces/blockGroup.interface";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "../interfaces/queryHookOptions";
import {
  DeleteMyBlockGroupById,
  DeleteMyBlockGroupsByIds,
  InsertBlockGroupAndItsBlocksByBlockPackId,
  InsertBlockGroupByBlockPackId,
  InsertBlockGroupsAndTheirBlocksByBlockPackId,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId,
  MoveMyBlockGroupsByIds,
  RestoreMyBlockGroupById,
  RestoreMyBlockGroupsByIds,
} from "../invokers/blockGroup.invoker";
import { getQueryClient } from "../queryClient";
import { queryKeys } from "../queryKeys";

export const useGetMyBlockGroupById = (
  hookRequest?: GetMyBlockGroupByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroup.myOneById(
      hookRequest?.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyBlockGroupById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockGroupByIdRequest
  ): Promise<GetMyBlockGroupByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.myOneById(
        callbackRequest.param.blockGroupId as UUID
      ),
      queryFn: async () => await queryFnGetMyBlockGroupById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_GROUP_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockGroupAndItsBlocksById = (
  hookRequest?: GetMyBlockGroupAndItsBlocksByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroup.myOneById(
      hookRequest?.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockGroupAndItsBlocksById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockGroupAndItsBlocksByIdRequest
  ): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.myOneById(
        callbackRequest.param.blockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupAndItsBlocksById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_GROUP_AND_ITS_BLOCKS_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockGroupsAndTheirBlocksByBlockPackId = (
  hookRequest?: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroup.myManyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.myManyByBlockPackId(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(
          callbackRequest
        ),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useGetMyBlockGroupsByPrevBlockGroupId = (
  hookRequest?: GetMyBlockGroupsByPrevBlockGroupIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroup.myManyByPrevBlockGroupId(
      hookRequest?.param.prevBlockGroupId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockGroupsByPrevBlockGroupId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockGroupsByPrevBlockGroupIdRequest
  ): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.myManyByPrevBlockGroupId(
        callbackRequest.param.prevBlockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupsByPrevBlockGroupId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_GROUPS_BY_PREV_BLOCK_GROUP_ID" as const,
  };
};

export const useGetAllMyBlockGroupsByBlockPackId = (
  hookRequest?: GetAllMyBlockGroupsByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroup.myManyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetAllMyBlockGroupsByBlockPackId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMyBlockGroupsByBlockPackIdRequest
  ): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.myManyByBlockPackId(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMyBlockGroupsByBlockPackId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_BLOCK_GROUPS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useInsertBlockGroupByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: InsertBlockGroupByBlockPackIdRequest
    ): Promise<InsertBlockGroupByBlockPackIdResponse> => {
      const validatedRequest =
        InsertBlockGroupByBlockPackIdRequestSchema.parse(request);
      return await InsertBlockGroupByBlockPackId(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const prevBlockGroupId = variables.body.prevBlockGroupId;
      const blockPackId = variables.body.blockPackId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupId === k[2];
                case "myManyByBlockPackId":
                  return blockPackId === k[2];
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
    name: "INSERT_BLOCK_GROUP_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useInsertBlockGroupAndItsBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: InsertBlockGroupAndItsBlocksByBlockPackIdRequest
    ): Promise<InsertBlockGroupAndItsBlocksByBlockPackIdResponse> => {
      const validatedRequest =
        InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema.parse(request);
      return await InsertBlockGroupAndItsBlocksByBlockPackId(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const prevBlockGroupId = variables.body.prevBlockGroupId;
      const blockPackId = variables.body.blockPackId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupId === k[2];
                case "myManyByBlockPackId":
                  return blockPackId === k[2];
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
    name: "INSERT_BLOCK_GROUP_AND_ITS_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useInsertBlockGroupsAndTheirBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest
    ): Promise<InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
      const validatedRequest =
        InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.parse(
          request
        );
      return await InsertBlockGroupsAndTheirBlocksByBlockPackId(
        validatedRequest
      );
    },
    onSuccess: (response, variables) => {
      const prevBlockGroupIdsSet = new Set(
        variables.body.blockGroupContents
          .map(content => content.prevBlockGroupId)
          .filter((id): id is UUID => id !== null)
      );
      const blockPackId = variables.body.blockPackId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupIdsSet.has(k[2]);
                case "myManyByBlockPackId":
                  return blockPackId === k[2];
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
    name: "INSERT_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest
    ): Promise<InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
      const validatedRequest =
        InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.parse(
          request
        );
      return await InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId(
        validatedRequest
      );
    },
    onSuccess: (response, variables) => {
      const prevBlockGroupId = variables.body.prevBlockGroupId;
      const blockPackId = variables.body.blockPackId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupId === k[2];
                case "myManyByBlockPackId":
                  return blockPackId === k[2];
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
    name: "INSERT_SEQUENTIAL_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useMoveMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMyBlockGroupsByIdsRequest
    ): Promise<MoveMyBlockGroupsByIdsResponse> => {
      const validatedRequest =
        MoveMyBlockGroupsByIdsRequestSchema.parse(request);
      return await MoveMyBlockGroupsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const movableBlockGroupIdsSet = new Set(
        variables.body.movableBlockGroupIds
      );
      const movablePrevBlockGroupIdsSet = new Set(
        variables.body.movablePrevBlockGroupIds
      );
      const destinationBlockGroupId = variables.body.destinationBlockGroupId;
      const blockPackId = variables.body.blockPackId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myOneById":
                  return movableBlockGroupIdsSet.has(k[0]);
                case "myManyByBlockPackId":
                  return blockPackId === k[0];
                case "myManyByPrevBlockGroupId":
                  return (
                    destinationBlockGroupId === k[0] ||
                    movablePrevBlockGroupIdsSet.has(k[0])
                  );
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
    name: "MOVE_MY_BLOCK_GROUPS_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockGroupByIdRequest
    ): Promise<RestoreMyBlockGroupByIdResponse> => {
      const validatedRequest =
        RestoreMyBlockGroupByIdRequestSchema.parse(request);
      return await RestoreMyBlockGroupById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupId = variables.body.blockGroupId;
      const blockPackId = response.data.blockPackId;
      const prevBlockGroupId = response.data.prevBlockGroupId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myOneById":
                  return blockGroupId === k[2];
                case "myManyByBlockPackId":
                  return blockPackId === k[2];
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupId === k[2];
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
    name: "RESTORE_MY_BLOCK_GROUP_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockGroupsByIdsRequest
    ): Promise<RestoreMyBlockGroupsByIdsResponse> => {
      const validatedRequest =
        RestoreMyBlockGroupsByIdsRequestSchema.parse(request);
      return await RestoreMyBlockGroupsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupIdsSet = new Set(
        (variables.body.blockGroupIds || []).filter(Boolean) as UUID[]
      );
      const blockPackIdsSet = new Set(
        response.data
          .map(fields => fields.blockPackId)
          .filter((id): id is UUID => id !== null)
      );
      const prevBlockGroupIdsSet = new Set(
        response.data
          .map(fields => fields.blockPackId)
          .filter((id): id is UUID => id !== null)
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackIdsSet.has(k[2]);
            case "blockGroup":
              switch (k[1]) {
                case "myOneById":
                  return blockGroupIdsSet.has(k[2]);
                case "myManyByBlockPackId":
                  return blockPackIdsSet.has(k[2]);
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupIdsSet.has(k[2]);
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
    name: "RESTORE_MY_BLOCK_GROUPS_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockGroupByIdRequest
    ): Promise<DeleteMyBlockGroupByIdResponse> => {
      const validatedRequest =
        DeleteMyBlockGroupByIdRequestSchema.parse(request);
      return await DeleteMyBlockGroupById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupId = variables.body.blockGroupId;
      const blockPackId = variables.affected.blockPackId;
      const prevBlockGroupId = variables.affected.prevBlockGroupId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackId === k[2];
            case "blockGroup":
              switch (k[1]) {
                case "myOneById":
                  return blockGroupId === k[2];
                case "myManyByBlockPackId":
                  return blockPackId === k[2];
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupId === k[2];
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
    name: "DELETE_MY_BLOCK_GROUP_BY_ID_HOOK" as const,
  };
};

export const useDeleteMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockGroupsByIdsRequest
    ): Promise<DeleteMyBlockGroupsByIdsResponse> => {
      const validatedRequest =
        DeleteMyBlockGroupsByIdsRequestSchema.parse(request);
      return await DeleteMyBlockGroupsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupIdsSet = new Set(
        (variables.body.blockGroupIds || []).filter(Boolean) as UUID[]
      );
      const blockPackIdsSet = new Set(variables.affected.blockPackIds);
      const prevBlockGroupIdsSet = new Set(
        variables.affected.prevBlockGroupIds
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "blockPack":
              return k[1] === "myOneById" && blockPackIdsSet.has(k[2]);
            case "blockGroup":
              switch (k[1]) {
                case "myOneById":
                  return blockGroupIdsSet.has(k[2]);
                case "myManyByBlockPackId":
                  return blockPackIdsSet.has(k[2]);
                case "myManyByPrevBlockGroupId":
                  return prevBlockGroupIdsSet.has(k[2]);
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
    name: "DELETE_MY_BLOCK_GROUPS_BY_IDS_HOOK" as const,
  };
};
