import {
  queryFnGetAllMyBlockGroupsByBlockPackId,
  queryFnGetMyBlockGroupAndItsBlocksById,
  queryFnGetMyBlockGroupById,
  queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId,
  queryFnGetMyBlockGroupsAndTheirBlocksByIds,
  queryFnGetMyBlockGroupsByPrevBlockGroupId,
} from "@shared/api/functions/blockGroup.function";
import {
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
} from "@shared/api/interfaces/blockGroup.interface";
import { PrefetchQueryDefaultOptions } from "@shared/api/interfaces/queryHookOptions";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";

export const prefetchGetMyBlockGroupById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockGroupByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockGroup.oneById(
        prefetchRequest.param.blockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_GROUP_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockGroupAndItsBlocksById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockGroupAndItsBlocksByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.oneById(
        prefetchRequest.param.blockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupAndItsBlocksById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_GROUP_AND_ITS_BLOCKS_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockGroupsAndTheirBlocksByIds = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockGroupsAndTheirBlocksByIdsRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.manyByIds(
        prefetchRequest.param.blockGroupIds as UUID[]
      ),
      queryFn: async () => {
        const response = await queryFnGetMyBlockGroupsAndTheirBlocksByIds(
          prefetchRequest,
          true
        );

        response.data.map(blockGroupAndItsBlock => {
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
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_IDS_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockGroupsAndTheirBlocksByBlockPackId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
        prefetchRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(
          prefetchRequest,
          true
        ),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_GROUPS_AND_THEIR_BLOCKS_BY_BLOCK_PACK_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockGroupsByPrevBlockGroupId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockGroupsByPrevBlockGroupIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
        prefetchRequest.param.prevBlockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockGroupsByPrevBlockGroupId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_GROUPS_BY_PREV_BLOCK_GROUP_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMyBlockGroupsByBlockPackId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMyBlockGroupsByBlockPackIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockGroup.manyByBlockPackId(
        prefetchRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMyBlockGroupsByBlockPackId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_BLOCK_GROUPS_BY_BLOCK_PACK_ID_PREFETCH" as const,
  };
};
