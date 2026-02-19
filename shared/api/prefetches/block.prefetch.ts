import {
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockGroupId,
  queryFnGetMyBlocksByBlockGroupIds,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/functions/block.function";
import {
  GetAllMyBlocksRequest,
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import { PrefetchQueryDefaultOptions } from "@shared/api/interfaces/queryHookOptions";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";

export const prefetchGetMyBlockById = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.oneById(prefetchRequest.param.blockId as UUID),
      queryFn: async () => await queryFnGetMyBlockById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlocksByIds = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlocksByIdsRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.manyByIds(
        prefetchRequest.param.blockIds as UUID[]
      ),
      queryFn: async () => {
        const response = await queryFnGetMyBlocksByIds(prefetchRequest, true);

        response.data.forEach(block => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.oneById(block.id as UUID),
            },
            duplicateResponse(response, undefined, block)
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
    name: "GET_MY_BLOCKS_BY_IDS_PREFETCH" as const,
  };
};

export const prefetchGetMyBlocksByBlockGroupId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlocksByBlockGroupIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.manyByBlockGroupId(
        prefetchRequest.param.blockGroupId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlocksByBlockGroupId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCKS_BY_BLOCK_GROUP_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlocksByBlockGroupIds = (
  initialQueryClient: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlocksByBlockGroupIdsRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.manyByBlockGroupIds(
        prefetchRequest.param.blockGroupIds as UUID[]
      ),
      queryFn: async () => {
        const response = await queryFnGetMyBlocksByBlockGroupIds(
          prefetchRequest,
          true
        );

        prefetchRequest.param.blockGroupIds.forEach((blockGroupId, index) => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.manyByBlockGroupId(
                blockGroupId as UUID
              ),
            },
            duplicateResponse(response, undefined, response.data[index])
          );
        });

        return response;
      },
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCKS_BY_BLOCK_GROUP_IDS_PREFETCH" as const,
  };
};

export const prefetchGetMyBlocksByBlockPackId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlocksByBlockPackIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.manyByBlockPackId(
        prefetchRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlocksByBlockPackId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCKS_BY_BLOCK_PACK_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMyBlocks = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMyBlocksRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.all(),
      queryFn: async () => {
        const response = await queryFnGetAllMyBlocks(prefetchRequest, true);

        response.data.forEach(block => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.oneById(block.id as UUID),
            },
            duplicateResponse(response, undefined, block)
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
    name: "GET_ALL_MY_BLOCKS_PREFETCH" as const,
  };
};
