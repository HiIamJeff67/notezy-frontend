import type { UUID } from "node:crypto";
import { ErrorLink } from "@apollo/client/link/error";
import {
  mutationFnBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds,
  mutationFnBatchInsertBlockGroupsByBlockPackIds,
  mutationFnBatchMoveMyBlockGroupsByIds,
  mutationFnDeleteMyBlockGroupById,
  mutationFnDeleteMyBlockGroupsByIds,
  mutationFnInsertBlockGroupAndItsBlocksByBlockPackId,
  mutationFnInsertBlockGroupByBlockPackId,
  mutationFnInsertBlockGroupsAndTheirBlocksByBlockPackId,
  mutationFnInsertBlockGroupsByBlockPackId,
  mutationFnInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId,
  mutationFnMoveMyBlockGroupById,
  mutationFnMoveMyBlockGroupsByIds,
  mutationFnRestoreMyBlockGroupById,
  mutationFnRestoreMyBlockGroupsByIds,
  queryFnGetAllMyBlockGroupsByBlockPackId,
  queryFnGetMyBlockGroupAndItsBlocksById,
  queryFnGetMyBlockGroupById,
  queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId,
  queryFnGetMyBlockGroupsAndTheirBlocksByIds,
  queryFnGetMyBlockGroupsByPrevBlockGroupId,
} from "@shared/api/functions/blockGroup.function";
import type {
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
} from "@shared/api/interfaces/blockGroup.interface";
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
    queryKey: queryKeys.blockGroupWithBlock.oneById(
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
      queryKey: queryKeys.blockGroupWithBlock.oneById(
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

export const useGetMyBlockGroupsAndTheirBlocksByIds = (
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
    queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
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
      queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
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
    mutationFn: mutationFnInsertBlockGroupByBlockPackId,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "INSERT_BLOCK_GROUP_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useInsertBlockGroupsByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlockGroupsByBlockPackId,
    onSuccess: (_, variables) => {
      const blockPackId = variables.body.blockPackId as UUID;
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockPackContent of variables.body.blockPackContents) {
        prevBlockGroupIds.push(
          blockPackContent.prevBlockGroupId as UUID | null
        );
      }
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
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
    name: "INSERT_BLOCK_GROUPS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useBatchInsertBlockGroupsByBlockPackIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBatchInsertBlockGroupsByBlockPackIds,
    onSuccess: (_, variables) => {
      const blockPackIds: UUID[] = [];
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockPackContent of variables.body.blockPackContents) {
        blockPackIds.push(blockPackContent.blockPackId as UUID);
        prevBlockGroupIds.push(
          blockPackContent.prevBlockGroupId as UUID | null
        );
      }
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
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
    name: "BATCH_INSERT_BLOCK_GROUPS_BY_BLOCK_PACK_IDS_HOOK" as const,
  };
};

export const useInsertBlockGroupAndItsBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlockGroupAndItsBlocksByBlockPackId,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
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
    mutationFn: mutationFnInsertBlockGroupsAndTheirBlocksByBlockPackId,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "INSERT_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds,
    onSuccess: (_, variables) => {
      const blockPackIds: UUID[] = [];
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockGroupContent of variables.body.blockGroupContents) {
        blockPackIds.push(blockGroupContent.blockPackId as UUID);
        prevBlockGroupIds.push(
          blockGroupContent.prevBlockGroupId as UUID | null
        );
      }
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
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
    name: "BATCH_INSERT_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_IDS_HOOK" as const,
  };
};

export const useInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn:
      mutationFnInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "INSERT_SEQUENTIAL_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useMoveMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMyBlockGroupById,
    onSuccess: (_, variables) => {
      const movableBlockGroupId = variables.body.movableBlockGroupId as UUID;
      const movablePrevBlockGroupId = variables.body
        .movablePrevBlockGroupId as UUID | null;
      const blockPackId = variables.body.blockPackId as UUID;
      const destinationBlockGroupId = variables.body
        .destinationBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.oneById(movableBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(movableBlockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(movablePrevBlockGroupId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(destinationBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(
          destinationBlockGroupId ?? undefined
        ),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
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
    name: "MOVE_MY_BLOCK_GROUP_BY_ID_HOOK" as const,
  };
};

export const useMoveMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMyBlockGroupsByIds,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "MOVE_MY_BLOCK_GROUPS_BY_IDS_HOOK" as const,
  };
};

export const useBatchMoveMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBatchMoveMyBlockGroupsByIds,
    onSuccess: (_, variables) => {
      const movableBlockGroupIds = [] as UUID[];
      const movablePrevBlockGroupIds = [] as (UUID | null)[];
      const blockPackIds = [] as UUID[];
      const destinationBlockGroupIds = [] as (UUID | null)[];
      for (const movedBlockGroup of variables.body.movedBlockGroups) {
        movableBlockGroupIds.push(movedBlockGroup.movableBlockGroupId as UUID);
        movablePrevBlockGroupIds.push(
          movedBlockGroup.movablePrevBlockGroupId as UUID
        );
        blockPackIds.push(movedBlockGroup.blockPackId as UUID);
        destinationBlockGroupIds.push(
          movedBlockGroup.destinationBlockGroupId as UUID
        );
      }
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...movableBlockGroupIds.flatMap(movableBlockGroupId => [
          queryKeys.blockGroup.oneById(movableBlockGroupId),
          queryKeys.blockGroupWithBlock.oneById(movableBlockGroupId),
        ]),
        ...movablePrevBlockGroupIds.map(movablePrevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(movablePrevBlockGroupId)
        ),
        ...destinationBlockGroupIds.flatMap(destinationBlockGroupId => [
          queryKeys.blockGroup.manyByPrevBlockGroupId(destinationBlockGroupId),
          queryKeys.blockGroupWithBlock.oneById(
            destinationBlockGroupId ?? undefined
          ),
        ]),
        queryKeys.blockGroupWithBlock.manyByIds(movableBlockGroupIds),
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
    name: "BATCH_MOVE_MY_BLOCK_GROUPS_BY_IDS_HOOK" as const,
  };
};

export const useRestoreMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlockGroupById,
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
    },
    onError: error => {
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
    mutationFn: mutationFnRestoreMyBlockGroupsByIds,
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
    },
    onError: error => {
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
    mutationFn: mutationFnDeleteMyBlockGroupById,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
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
    mutationFn: mutationFnDeleteMyBlockGroupsByIds,
    onSuccess: (_, variables) => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_BLOCK_GROUPS_BY_IDS_HOOK" as const,
  };
};
