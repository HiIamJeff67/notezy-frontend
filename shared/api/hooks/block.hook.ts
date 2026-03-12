import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockGroupId,
  queryFnGetMyBlocksByBlockGroupIds,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/functions/block.function";
import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlockByIdRequestSchema,
  DeleteMyBlockByIdResponse,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsRequestSchema,
  DeleteMyBlocksByIdsResponse,
  GetAllMyBlocksRequest,
  GetAllMyBlocksResponse,
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdResponse,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockGroupIdsResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
  InsertBlockRequest,
  InsertBlockRequestSchema,
  InsertBlockResponse,
  InsertBlocksRequest,
  InsertBlocksRequestSchema,
  InsertBlocksResponse,
  RestoreMyBlockByIdRequest,
  RestoreMyBlockByIdRequestSchema,
  RestoreMyBlockByIdResponse,
  RestoreMyBlocksByIdsRequest,
  RestoreMyBlocksByIdsRequestSchema,
  RestoreMyBlocksByIdsResponse,
  UpdateMyBlockByIdRequest,
  UpdateMyBlockByIdRequestSchema,
  UpdateMyBlockByIdResponse,
  UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsRequestSchema,
  UpdateMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  DeleteMyBlockById,
  DeleteMyBlocksByIds,
  InsertBlock,
  InsertBlocks,
  RestoreMyBlockById,
  RestoreMyBlocksByIds,
  UpdateMyBlockById,
  UpdateMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  FetchQueryOptions,
  QueryKey,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";
import { GetMyBlockPackByIdResponse } from "../interfaces/blockPack.interface";

export const useGetMyBlockById = (
  hookRequest?: GetMyBlockByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.oneById(
      hookRequest?.param.blockId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyBlockById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockByIdRequest
  ): Promise<GetMyBlockByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.block.oneById(callbackRequest.param.blockId as UUID),
      queryFn: async () => await queryFnGetMyBlockById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlocksByIds = (
  hookRequest?: GetMyBlocksByIdsRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.manyByIds(
      hookRequest?.param.blockIds as UUID[] | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByIds(hookRequest);

      if (response.success && response.data) {
        response.data.forEach((block: any) => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.oneById(block.id as UUID),
            },
            duplicateResponse(response, true, block)
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
    callbackRequest: GetMyBlocksByIdsRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetMyBlocksByIdsResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByIds(
        callbackRequest.param.blockIds as UUID[]
      ),
      queryFn: async () => {
        const response = await queryFnGetMyBlocksByIds(callbackRequest);

        if (response.success && response.data) {
          response.data.forEach((block: any) => {
            queryClient.setQueriesData(
              {
                queryKey: queryKeys.block.oneById(block.id as UUID),
              },
              duplicateResponse(response, true, block)
            );
          });
        }

        return response;
      },
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetMyBlocksByIdsResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCKS_BY_IDS_HOOK" as const,
  };
};

export const useGetMyBlocksByBlockGroupId = (
  hookRequest?: GetMyBlocksByBlockGroupIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.manyByBlockGroupId(
      hookRequest?.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyBlocksByBlockGroupId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlocksByBlockGroupIdRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetMyBlocksByBlockGroupIdResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockGroupId(
        callbackRequest.param.blockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlocksByBlockGroupId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetMyBlocksByBlockGroupIdResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCKS_BY_BLOCK_GROUP_ID_HOOK" as const,
  };
};

export const useGetMyBlocksByBlockGroupIds = (
  hookRequest?: GetMyBlocksByBlockGroupIdsRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.manyByBlockGroupIds(
      hookRequest?.param.blockGroupIds as UUID[] | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByBlockGroupIds(hookRequest);

      if (hookRequest && response.success && response.data) {
        hookRequest.param.blockGroupIds.forEach((blockGroupId, index) => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.manyByBlockGroupId(
                blockGroupId as UUID
              ),
            },
            duplicateResponse(response, undefined, response.data[index])
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
    callbackRequest: GetMyBlocksByBlockGroupIdsRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetMyBlocksByBlockGroupIdsResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockGroupIds(
        callbackRequest.param.blockGroupIds as UUID[]
      ),
      queryFn: async () => {
        const response =
          await queryFnGetMyBlocksByBlockGroupIds(callbackRequest);

        if (hookRequest && response.success && response.data) {
          hookRequest.param.blockGroupIds.forEach((blockGroupId, index) => {
            queryClient.setQueriesData(
              {
                queryKey: queryKeys.block.manyByBlockGroupId(
                  blockGroupId as UUID
                ),
              },
              duplicateResponse(response, undefined, response.data[index])
            );
          });
        }

        return response;
      },
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetMyBlocksByBlockGroupIdsResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCKS_BY_BLOCK_GROUP_IDS_HOOK" as const,
  };
};

export const useGetMyBlocksByBlockPackId = (
  hookRequest?: GetMyBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.manyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyBlocksByBlockPackId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlocksByBlockPackIdRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetMyBlocksByBlockPackIdResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockPackId(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlocksByBlockPackId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetMyBlocksByBlockPackIdResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useGetAllMyBlocks = (
  hookRequest?: GetAllMyBlocksRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.myAll(),
    queryFn: async () => await queryFnGetAllMyBlocks(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMyBlocksRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetAllMyBlocksResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.block.myAll(),
      queryFn: async () => await queryFnGetAllMyBlocks(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetAllMyBlocksResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_BLOCKS_HOOK" as const,
  };
};

export const useInsertBlock = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: InsertBlockRequest
    ): Promise<InsertBlockResponse> => {
      const validatedRequest = InsertBlockRequestSchema.parse(request);
      return await InsertBlock(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupId = variables.body.blockGroupId as UUID;
      const blockPackId = variables.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(blockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.block.myAll(),
      ];
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData || !oldData.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount: oldData.data.blockCount + 1,
            },
          };
        }
      );
      Promise.all(
        targetKeys.map(targetKey => {
          queryClient.invalidateQueries({ queryKey: targetKey });
        })
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

  return { ...mutation, name: "INSERT_BLOCK_HOOK" as const };
};

export const useInsertBlocks = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: InsertBlocksRequest
    ): Promise<InsertBlocksResponse> => {
      const validatedRequest = InsertBlocksRequestSchema.parse(request);
      return await InsertBlocks(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackId = variables.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.block.myAll(),
      ] as any[];
      response.data.successBlockGroupAndBlockIds.forEach(
        blockGroupAndBlocks => {
          if (!blockGroupIdsSet.has(blockGroupAndBlocks.blockGroupId as UUID)) {
            blockGroupIdsSet.add(blockGroupAndBlocks.blockGroupId as UUID);
            targetKeys.push(
              queryKeys.block.manyByBlockGroupId(
                blockGroupAndBlocks.blockGroupId as UUID
              ),
              queryKeys.blockGroup.oneById(
                blockGroupAndBlocks.blockGroupId as UUID
              )
            );
            queryKeys.blockGroupWithBlock.oneById(
              blockGroupAndBlocks.blockGroupId as UUID
            );
          }
        }
      );
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData || !oldData.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount:
                oldData.data.blockCount + response.data.successIndexes.length,
            },
          };
        }
      );
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

  return { ...mutation, name: "INSERT_BLOCKS_HOOK" as const };
};

export const useUpdateMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMyBlockByIdRequest
    ): Promise<UpdateMyBlockByIdResponse> => {
      const validatedRequest = UpdateMyBlockByIdRequestSchema.parse(request);
      return await UpdateMyBlockById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockGroupId = variables.affected.blockGroupId as UUID;
      const blockPackId = variables.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.block.myAll(),
      ];
      Promise.all(
        targetKeys.map(targetKey => {
          queryClient.invalidateQueries({ queryKey: targetKey });
        })
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

  return { ...mutation, name: "UPDATE_MY_BLOCK_BY_ID_HOOK" as const };
};

export const useUpdateMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMyBlocksByIdsRequest
    ): Promise<UpdateMyBlocksByIdsResponse> => {
      const validatedRequest = UpdateMyBlocksByIdsRequestSchema.parse(request);
      return await UpdateMyBlocksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      variables.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(
            queryKeys.block.manyByBlockPackId(blockPackId as UUID),
            queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId as UUID)
          );
        }
      });
      response.data.successBlockGroupAndBlockIds.forEach(
        blockGroupAndBlocks => {
          if (!blockGroupIdsSet.has(blockGroupAndBlocks.blockGroupId as UUID)) {
            blockGroupIdsSet.add(blockGroupAndBlocks.blockGroupId as UUID);
            targetKeys.push(
              queryKeys.block.manyByBlockGroupId(
                blockGroupAndBlocks.blockGroupId as UUID
              ),
              queryKeys.blockGroupWithBlock.oneById(
                blockGroupAndBlocks.blockGroupId as UUID
              )
            );
          }
          blockGroupAndBlocks.blockIds.forEach(blockId => {
            if (!blockIdsSet.has(blockId as UUID)) {
              blockIdsSet.add(blockId as UUID);
              targetKeys.push(queryKeys.block.oneById(blockId as UUID));
            }
          });
        }
      );
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
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

  return { ...mutation, name: "UPDATE_MY_BLOCKS_BY_IDS_HOOK" as const };
};

export const useRestoreMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockByIdRequest
    ): Promise<RestoreMyBlockByIdResponse> => {
      const validatedRequest = RestoreMyBlockByIdRequestSchema.parse(request);
      return await RestoreMyBlockById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockId = variables.body.blockId as UUID;
      const blockGroupId = response.data.blockGroupId as UUID;
      const blockPackId = variables.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [queryKeys.block.oneById(blockId)];
      targetKeys.push(
        queryKeys.block.oneById(blockId),
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.block.myAll()
      );
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData || !oldData.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount: oldData.data.blockCount + 1,
            },
          };
        }
      );
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

  return { ...mutation, name: "RESTORE_MY_BLOCK_BY_ID_HOOK" as const };
};

export const useRestoreMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlocksByIdsRequest
    ): Promise<RestoreMyBlocksByIdsResponse> => {
      const validatedRequest = RestoreMyBlocksByIdsRequestSchema.parse(request);
      return await RestoreMyBlocksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      variables.body.blockIds.forEach(blockId => {
        if (!blockIdsSet.has(blockId as UUID)) {
          blockIdsSet.add(blockId as UUID);
          targetKeys.push(queryKeys.block.oneById(blockId as UUID));
        }
      });
      variables.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(queryKeys.blockPack.oneById(blockPackId as UUID));
        }
      });
      response.data.forEach(block => {
        if (!blockGroupIdsSet.has(block.blockGroupId as UUID)) {
          blockGroupIdsSet.add(block.blockGroupId as UUID);
          targetKeys.push(
            queryKeys.block.manyByBlockGroupId(block.blockGroupId as UUID),
            queryKeys.blockGroup.oneById(block.blockGroupId as UUID)
          );
        }
      });
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
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

  return { ...mutation, name: "RESTORE_MY_BLOCKS_BY_IDS_HOOK" as const };
};

export const useDeleteMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockByIdRequest
    ): Promise<DeleteMyBlockByIdResponse> => {
      const validatedRequest = DeleteMyBlockByIdRequestSchema.parse(request);
      return await DeleteMyBlockById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockId = variables.body.blockId as UUID;
      const blockGroupId = variables.affected.blockGroupId as UUID;
      const blockPackId = variables.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.block.oneById(blockId),
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.block.myAll(),
      ];
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData || !oldData.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount: oldData.data.blockCount - 1,
            },
          };
        }
      );
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

  return { ...mutation, name: "DELETE_MY_BLOCK_BY_ID_HOOK" as const };
};

export const useDeleteMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlocksByIdsRequest
    ): Promise<DeleteMyBlocksByIdsResponse> => {
      const validatedRequest = DeleteMyBlocksByIdsRequestSchema.parse(request);
      return await DeleteMyBlocksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      variables.body.blockIds.forEach(blockId => {
        if (!blockIdsSet.has(blockId as UUID)) {
          blockIdsSet.add(blockId as UUID);
          targetKeys.push(queryKeys.block.oneById(blockId as UUID));
        }
      });
      variables.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(queryKeys.blockPack.oneById(blockPackId as UUID));
        }
      });
      variables.affected.blockGroupIds.forEach(blockGroupId => {
        if (!blockGroupIdsSet.has(blockGroupId as UUID)) {
          blockGroupIdsSet.add(blockGroupId as UUID);
          targetKeys.push(
            queryKeys.block.manyByBlockGroupId(blockGroupId as UUID),
            queryKeys.blockGroup.oneById(blockGroupId as UUID)
          );
        }
      });
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
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

  return { ...mutation, name: "DELETE_MY_BLOCKS_BY_IDS_HOOK" as const };
};
