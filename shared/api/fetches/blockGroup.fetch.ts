import type { UUID } from "node:crypto";
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
import {
  queryFnGetAllMyBlockGroupsByBlockPackId,
  queryFnGetMyBlockGroupAndItsBlocksById,
  queryFnGetMyBlockGroupById,
  queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId,
  queryFnGetMyBlockGroupsAndTheirBlocksByIds,
  queryFnGetMyBlockGroupsByPrevBlockGroupId,
} from "@shared/api/invokers/blockGroup.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { QueryAsyncDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import type { FetchQueryOptions, QueryClient } from "@tanstack/react-query";

export const fetchGetMyBlockGroupById = async (
  fetchRequest: GetMyBlockGroupByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockGroupByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockGroup.oneById(
      fetchRequest.param.blockGroupId as UUID
    ),
    queryFn: async () => await queryFnGetMyBlockGroupById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockGroupByIdResponse;
};

export const fetchGetMyBlockGroupAndItsBlocksById = async (
  fetchRequest: GetMyBlockGroupAndItsBlocksByIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockGroupWithBlock.oneById(
      fetchRequest.param.blockGroupId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyBlockGroupAndItsBlocksById(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockGroupAndItsBlocksByIdResponse;
};

export const fetchGetMyBlockGroupsAndTheirBlocksByIds = async (
  fetchRequest: GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockGroupWithBlock.manyByIds(
      fetchRequest.param.blockGroupIds as UUID[]
    ),
    queryFn: async () => {
      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByIds(fetchRequest);

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
    ...options,
  });

  return response as GetMyBlockGroupsAndTheirBlocksByIdsResponse;
};

export const fetchGetMyBlockGroupsAndTheirBlocksByBlockPackId = async (
  fetchRequest: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
      fetchRequest.param.blockPackId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse;
};

export const fetchGetMyBlockGroupsByPrevBlockGroupId = async (
  fetchRequest: GetMyBlockGroupsByPrevBlockGroupIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
      fetchRequest.param.prevBlockGroupId as UUID
    ),
    queryFn: async () =>
      await queryFnGetMyBlockGroupsByPrevBlockGroupId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetMyBlockGroupsByPrevBlockGroupIdResponse;
};

export const fetchGetAllMyBlockGroupsByBlockPackId = async (
  fetchRequest: GetAllMyBlockGroupsByBlockPackIdRequest,
  initialQueryClient?: QueryClient,
  options?: Partial<FetchQueryOptions>
): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const response = await queryClient.fetchQuery({
    queryKey: queryKeys.blockGroup.manyByBlockPackId(
      fetchRequest.param.blockPackId as UUID
    ),
    queryFn: async () =>
      await queryFnGetAllMyBlockGroupsByBlockPackId(fetchRequest),
    staleTime: QueryAsyncDefaultOptions.staleTime as number,
    ...options,
  });

  return response as GetAllMyBlockGroupsByBlockPackIdResponse;
};
