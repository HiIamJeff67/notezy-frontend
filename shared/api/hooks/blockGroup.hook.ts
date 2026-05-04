import type { UUID } from "node:crypto";
import type {
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
} from "@shared/api/interfaces/blockGroup.interface";
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
} from "@shared/api/invokers/blockGroup.invoker";
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

export const useGetMyBlockGroupById = (
  hookRequest: GetMyBlockGroupByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.blockGroup.oneById(
      hookRequest.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlockGroupById(hookRequest);
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
    name: "GET_MY_BLOCK_GROUP_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockGroupAndItsBlocksById = (
  hookRequest: GetMyBlockGroupAndItsBlocksByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.blockGroupWithBlock.oneById(
      hookRequest.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupAndItsBlocksById(hookRequest);
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
    name: "GET_MY_BLOCK_GROUP_AND_ITS_BLOCKS_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockGroupsAndTheirBlocksByIds = (
  hookRequest: GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroupWithBlock.manyByIds(
      hookRequest.param.blockGroupIds as UUID[] | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByIds(hookRequest);
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

  return {
    ...query,
    name: "GET_MY_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_IDS_HOOK" as const,
  };
};

export const useGetMyBlockGroupsAndTheirBlocksByBlockPackId = (
  hookRequest: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
      hookRequest.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(hookRequest);
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
            queryKey: queryKeys.block.manyByBlockGroupId(blockGroup.id as UUID),
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
    name: "GET_MY_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useGetMyBlockGroupsByPrevBlockGroupId = (
  hookRequest: GetMyBlockGroupsByPrevBlockGroupIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
      hookRequest.param.prevBlockGroupId as UUID | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupsByPrevBlockGroupId(hookRequest);
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
    name: "GET_MY_BLOCK_GROUPS_BY_PREV_BLOCK_GROUP_ID" as const,
  };
};

export const useGetAllMyBlockGroupsByBlockPackId = (
  hookRequest: GetAllMyBlockGroupsByBlockPackIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.blockGroup.manyByBlockPackId(
      hookRequest.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => {
      const response =
        await queryFnGetAllMyBlockGroupsByBlockPackId(hookRequest);
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
    name: "GET_ALL_MY_BLOCK_GROUPS_BY_BLOCK_PACK_ID_HOOK" as const,
  };
};

export const useInsertBlockGroupByBlockPackId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlockGroupByBlockPackId,
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupId = request.body.prevBlockGroupId as UUID | null;
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockPackContent of request.body.blockPackContents) {
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
      const blockPackIds: UUID[] = [];
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockPackContent of request.body.blockPackContents) {
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupId = request.body.prevBlockGroupId as UUID | null;
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
      const blockPackId = request.body.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(request.body.blockPackId as UUID),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        ...request.body.blockGroupContents.map(content =>
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
      const blockPackIds: UUID[] = [];
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockGroupContent of request.body.blockGroupContents) {
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupId = request.body.prevBlockGroupId as UUID | null;
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
      const movableBlockGroupId = request.body.movableBlockGroupId as UUID;
      const movablePrevBlockGroupId = request.body
        .movablePrevBlockGroupId as UUID | null;
      const blockPackId = request.body.blockPackId as UUID;
      const destinationBlockGroupId = request.body
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
      const movableBlockGroupIds = request.body
        .movableBlockGroupIds as UUID[];
      const movablePrevBlockGroupIds = request.body
        .movablePrevBlockGroupIds as (UUID | null)[];
      const blockPackId = request.body.blockPackId as UUID;
      const destinationBlockGroupId = request.body
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
      const movableBlockGroupIds = [] as UUID[];
      const movablePrevBlockGroupIds = [] as (UUID | null)[];
      const blockPackIds = [] as UUID[];
      const destinationBlockGroupIds = [] as (UUID | null)[];
      for (const movedBlockGroup of request.body.movedBlockGroups) {
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
      const blockGroupIds = request.body.blockGroupIds as UUID[];
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
      const prevBlockGroupId = request.affected
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
      const blockGroupIds = request.body.blockGroupIds as UUID[];
      const blockPackIds = request.affected.blockPackIds as UUID[];
      const prevBlockGroupIds = request.affected
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
