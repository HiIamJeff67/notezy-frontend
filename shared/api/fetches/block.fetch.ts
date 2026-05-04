import type { UUID } from "node:crypto";
import type {
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
} from "@shared/api/interfaces/block.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockGroupId,
  queryFnGetMyBlocksByBlockGroupIds,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";

export const fetchGetMyBlockById = async (
  fetchRequest: GetMyBlockByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.block.oneById(fetchRequest.param.blockId as UUID),
    queryFn: async () => await queryFnGetMyBlockById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockByIdResponse;
};

export const fetchGetMyBlocksByIds = async (
  fetchRequest: GetMyBlocksByIdsRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlocksByIdsResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.block.manyByIds(fetchRequest.param.blockIds as UUID[]),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByIds(fetchRequest);

      if (response.success && response.data) {
        response.data.forEach(block => {
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

export const fetchGetMyBlocksByBlockGroupId = async (
  fetchRequest: GetMyBlocksByBlockGroupIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlocksByBlockGroupIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.block.manyByBlockGroupId(
      fetchRequest.param.blockGroupId as UUID
    ),
    queryFn: async () => await queryFnGetMyBlocksByBlockGroupId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime,
    ...options,
  });

  return response as GetMyBlocksByBlockGroupIdResponse;
};

export const fetchGetMyBlocksByBlockGroupIds = async (
  fetchRequest: GetMyBlocksByBlockGroupIdsRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlocksByBlockGroupIdsResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.block.manyByBlockGroupIds(
      fetchRequest.param.blockGroupIds as UUID[]
    ),
    queryFn: async () => {
      const response = await queryFnGetMyBlocksByBlockGroupIds(fetchRequest);

      if (response.success && response.data) {
        fetchRequest.param.blockGroupIds.forEach((blockGroupId, index) => {
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

export const fetchGetMyBlocksByBlockPackId = async (
  fetchRequest: GetMyBlocksByBlockPackIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlocksByBlockPackIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.block.manyByBlockPackId(
      fetchRequest.param.blockPackId as UUID
    ),
    queryFn: async () => await queryFnGetMyBlocksByBlockPackId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime,
    ...options,
  });

  return response as GetMyBlocksByBlockPackIdResponse;
};

export const fetchGetAllMyBlocks = async (
  fetchRequest: GetAllMyBlocksRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetAllMyBlocksResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.block.myAll(),
    queryFn: async () => await queryFnGetAllMyBlocks(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime,
    ...options,
  });

  return response as GetAllMyBlocksResponse;
};
