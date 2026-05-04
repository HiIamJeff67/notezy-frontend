import type { UUID } from "node:crypto";
import {
  type GetAllMyBlocksRequest,
  type GetMyBlockByIdRequest,
  type GetMyBlocksByBlockGroupIdRequest,
  type GetMyBlocksByBlockGroupIdsRequest,
  type GetMyBlocksByBlockPackIdRequest,
  type GetMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import type { GetMyBlockPackByIdResponse } from "@shared/api/interfaces/blockPack.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
  mutationFnDeleteMyBlockById,
  mutationFnDeleteMyBlocksByIds,
  mutationFnInsertBlock,
  mutationFnInsertBlocks,
  mutationFnRestoreMyBlockById,
  mutationFnRestoreMyBlocksByIds,
  mutationFnUpdateMyBlockById,
  mutationFnUpdateMyBlocksByIds,
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockGroupId,
  queryFnGetMyBlocksByBlockGroupIds,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useGetMyBlockById = (
  hookRequest: GetMyBlockByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.block.oneById(
      hookRequest.param.blockId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlockById(hookRequest);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_MY_BLOCK_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlocksByIds = (
  hookRequest: GetMyBlocksByIdsRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.manyByIds(
      hookRequest.param.blockIds as UUID[] | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByIds(hookRequest);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
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

  return {
    ...query,
    name: "GET_MY_BLOCKS_BY_IDS_HOOK" as const,
  };
};

export const useGetMyBlocksByBlockGroupId = (
  hookRequest: GetMyBlocksByBlockGroupIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.block.manyByBlockGroupId(
      hookRequest.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByBlockGroupId(hookRequest);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_MY_BLOCKS_BY_BLOCK_GROUP_ID_HOOK" as const,
  };
};

export const useGetMyBlocksByBlockGroupIds = (
  hookRequest: GetMyBlocksByBlockGroupIdsRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.block.manyByBlockGroupIds(
      hookRequest.param.blockGroupIds as UUID[] | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByBlockGroupIds(hookRequest);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
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

  return {
    ...query,
    name: "GET_MY_BLOCKS_BY_BLOCK_GROUP_IDS_HOOK" as const,
  };
};

export const useGetMyBlocksByBlockPackId = (
  hookRequest: GetMyBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.block.manyByBlockPackId(
      hookRequest.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByBlockPackId(hookRequest);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_MY_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useGetAllMyBlocks = (
  hookRequest: GetAllMyBlocksRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.block.myAll(),
    queryFn: async () => {
      const response = await queryFnGetAllMyBlocks(hookRequest);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_ALL_MY_BLOCKS_HOOK" as const,
  };
};

export const useInsertBlock = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlock,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockGroupId = request.body.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
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
          if (!oldData?.success) return oldData;

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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "INSERT_BLOCK_HOOK" as const };
};

export const useInsertBlocks = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlocks,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackId = request.affected.blockPackId as UUID;
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
          if (!oldData?.success) return oldData;

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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "INSERT_BLOCKS_HOOK" as const };
};

export const useUpdateMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyBlockById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockGroupId = request.affected.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "UPDATE_MY_BLOCK_BY_ID_HOOK" as const };
};

export const useUpdateMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyBlocksByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockPackIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      request.affected.blockPackIds.forEach(blockPackId => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "UPDATE_MY_BLOCKS_BY_IDS_HOOK" as const };
};

export const useRestoreMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlockById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockId = request.body.blockId as UUID;
      const blockGroupId = response.data.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
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
          if (!oldData?.success) return oldData;

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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "RESTORE_MY_BLOCK_BY_ID_HOOK" as const };
};

export const useRestoreMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlocksByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      request.body.blockIds.forEach(blockId => {
        if (!blockIdsSet.has(blockId as UUID)) {
          blockIdsSet.add(blockId as UUID);
          targetKeys.push(queryKeys.block.oneById(blockId as UUID));
        }
      });
      request.affected.blockPackIds.forEach(blockPackId => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "RESTORE_MY_BLOCKS_BY_IDS_HOOK" as const };
};

export const useDeleteMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyBlockById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockId = request.body.blockId as UUID;
      const blockGroupId = request.affected.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
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
          if (!oldData?.success) return oldData;

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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "DELETE_MY_BLOCK_BY_ID_HOOK" as const };
};

export const useDeleteMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyBlocksByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.embeddedPublicId
      );
      const blockIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      request.body.blockIds.forEach(blockId => {
        if (!blockIdsSet.has(blockId as UUID)) {
          blockIdsSet.add(blockId as UUID);
          targetKeys.push(queryKeys.block.oneById(blockId as UUID));
        }
      });
      request.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(queryKeys.blockPack.oneById(blockPackId as UUID));
        }
      });
      request.affected.blockGroupIds.forEach(blockGroupId => {
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
    },
    onError: error => {
      throw error;
    },
  });

  return { ...mutation, name: "DELETE_MY_BLOCKS_BY_IDS_HOOK" as const };
};
