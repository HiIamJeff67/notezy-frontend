import {
  queryFnGetAllMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@shared/api/functions/blockPack.function";
import {
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackByIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequest,
} from "@shared/api/interfaces/blockPack.interface";
import { PrefetchQueryDefaultOptions } from "@shared/api/interfaces/queryHookOptions";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";

export const prefetchGetMyBlockPackById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPackByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.myOneById(
        prefetchRequest.param.blockPackId as UUID
      ),
      queryFn: async () => queryFnGetMyBlockPackById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_PACK_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockPackAndItsParentById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.myOneById(
        prefetchRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        queryFnGetMyBlockPackAndItsParentById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_PACK_AND_ITS_PARENT_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyBlockPacksByParentSubShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.myManyByParentSubShelfId(
        prefetchRequest.param.parentSubShelfId as UUID
      ),
      queryFn: async () =>
        queryFnGetMyBlockPacksByParentSubShelfId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_BLOCK_PACKS_BY_PARENT_SUB_SHELF_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMyBlockPacksByRootShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.blockPack.myManyByRootShelfId(
        prefetchRequest.param.rootShelfId as UUID
      ),
      queryFn: async () =>
        queryFnGetAllMyBlockPacksByRootShelfId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_BLOCK_PACKS_BY_ROOT_SHELF_ID_PREFETCH" as const,
  };
};
