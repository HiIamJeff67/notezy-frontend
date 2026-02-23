import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  QueryKey,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";
import { NotezyAPIError } from "../exceptions";
import {
  queryFnGetAllMyBlockGroupsByBlockPackId,
  queryFnGetMyBlockGroupAndItsBlocksById,
  queryFnGetMyBlockGroupById,
  queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId,
  queryFnGetMyBlockGroupsAndTheirBlocksByIds,
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
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsResponse,
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
    queryKey: queryKeys.blockGroup.oneById(
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
      queryKey: queryKeys.blockGroup.oneById(
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
    queryKey: queryKeys.blockGroup.oneById(
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
      queryKey: queryKeys.blockGroup.oneById(
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

export const GetMyBlockGroupsAndTheirBlocksByIds = (
  hookRequest?: GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroupWithBlock.manyByIds(
      hookRequest?.param.blockGroupIds as UUID[] | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByIds(hookRequest);

      if (hookRequest) {
        response.data.forEach(blockGroupAndItsBlock => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.blockGroupWithBlock.oneById(
                blockGroupAndItsBlock.id as UUID
              ),
            },
            blockGroupAndItsBlock
          );
        });
      }

      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockGroupsAndTheirBlocksByIdsRequest
  ): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.manyByIds(
        callbackRequest.param.blockGroupIds as UUID[]
      ),
      queryFn: async () => {
        const response =
          await queryFnGetMyBlockGroupsAndTheirBlocksByIds(callbackRequest);

        response.data.forEach(blockGroupAndItsBlock => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.blockGroupWithBlock.oneById(
                blockGroupAndItsBlock.id as UUID
              ),
            },
            blockGroupAndItsBlock
          );
        });

        return response;
      },
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_IDS_HOOK" as const,
  };
};

export const useGetMyBlockGroupsAndTheirBlocksByBlockPackId = (
  hookRequest?: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroup.manyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(hookRequest);

      if (hookRequest) {
        queryClient.setQueriesData(
          {
            queryKey: queryKeys.blockGroup.manyByBlockPackId(
              hookRequest.param.blockPackId as UUID
            ),
          },
          response
        );
        response.data.forEach(blockGroup => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.manyByBlockGroupId(
                blockGroup.id as UUID
              ),
            },
            response
          );
        });
        queryClient.setQueriesData(
          {
            queryKey: queryKeys.block.manyByBlockPackId(
              hookRequest.param.blockPackId as UUID
            ),
          },
          response
        );
      }

      return response;
    },
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
      queryKey: queryKeys.blockGroup.manyByBlockPackId(
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
    queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
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
      queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
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
    queryKey: queryKeys.blockGroup.manyByBlockPackId(
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
      queryKey: queryKeys.blockGroup.manyByBlockPackId(
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
      const blockPackId = variables.body.blockPackId as UUID;
      const prevBlockGroupId = variables.body.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockPackId = variables.body.blockPackId as UUID;
      const prevBlockGroupId = variables.body.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockPackId = variables.body.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(variables.body.blockPackId as UUID),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        ...variables.body.blockGroupContents.map(content =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(
            content.prevBlockGroupId as UUID | null
          )
        ),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockPackId = variables.body.blockPackId as UUID;
      const prevBlockGroupId = variables.body.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const movableBlockGroupIds = variables.body
        .movableBlockGroupIds as UUID[];
      const movablePrevBlockGroupIds = variables.body
        .movablePrevBlockGroupIds as (UUID | null)[];
      const blockPackId = variables.body.blockPackId as UUID;
      const destinationBlockGroupId = variables.body
        .destinationBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        ...movableBlockGroupIds.flatMap(movableBlockGroupId => [
          queryKeys.blockGroup.oneById(movableBlockGroupId),
          queryKeys.blockGroupWithBlock.oneById(movableBlockGroupId),
        ]),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        ...movablePrevBlockGroupIds.map(movablePrevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(movablePrevBlockGroupId)
        ),
        queryKeys.blockGroup.manyByPrevBlockGroupId(destinationBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(
          destinationBlockGroupId ?? undefined
        ),
        queryKeys.blockGroupWithBlock.manyByIds(movableBlockGroupIds),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockGroupId = variables.body.blockGroupId as UUID;
      const blockPackId = response.data.blockPackId as UUID;
      const prevBlockGroupId = response.data.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockGroupIds = variables.body.blockGroupIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...response.data.flatMap(field => [
          queryKeys.blockPack.oneById(field.blockPackId as UUID),
          queryKeys.blockPackWithBlockGroup.oneById(field.blockPackId as UUID),
          queryKeys.blockGroup.manyByBlockPackId(field.blockPackId as UUID),
          queryKeys.blockGroup.manyByPrevBlockGroupId(
            field.prevBlockGroupId as UUID | null
          ),
        ]),
        ...blockGroupIds.map(blockGroupId =>
          queryKeys.blockGroup.oneById(blockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockGroupId = variables.body.blockGroupId as UUID;
      const blockPackId = variables.affected.blockPackId as UUID;
      const prevBlockGroupId = variables.affected
        .prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      const blockGroupIds = variables.body.blockGroupIds as UUID[];
      const blockPackIds = variables.affected.blockPackIds as UUID[];
      const prevBlockGroupIds = variables.affected
        .prevBlockGroupIds as (UUID | null)[];
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...blockGroupIds.flatMap(blockGroupId => [
          queryKeys.blockGroup.oneById(blockGroupId),
          queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        ]),
        queryKeys.blockGroupWithBlock.manyByIds(blockGroupIds),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
