import {
  GetAllMyBlocksRequest,
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { PrefetchQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import type { UUID } from "crypto";

export const prefetchGetMyBlockById = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.block.oneById(prefetchRequest.param.blockId as UUID),
      queryFn: async () => await queryFnGetMyBlockById(prefetchRequest),
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
        const response = await queryFnGetMyBlocksByIds(prefetchRequest);

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
        await queryFnGetMyBlocksByBlockPackId(prefetchRequest),
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
        const response = await queryFnGetAllMyBlocks(prefetchRequest);

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
