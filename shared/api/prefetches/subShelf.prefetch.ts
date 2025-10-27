import {
  queryFnGetAllMySubShelvesByRootShelfId,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesByPrevSubShelfId,
} from "@shared/api/functions/subShelf.function";
import { PrefetchQueryDefaultOptions } from "@shared/api/interfaces/queryHookOptions";
import {
  GetAllMySubShelvesByRootShelfIdRequest,
  GetMySubShelfByIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequest,
} from "@shared/api/interfaces/subShelf.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";

export const prefetchGetMySubShelfById = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMySubShelfByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subShelf.myOneById(
        prefetchRequest.param.subShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMySubShelfById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_SUB_SHELF_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMySubShelvesByPrevSubShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subShelf.myManyByPrevSubShelfId(
        prefetchRequest.param.prevSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMySubShelvesByPrevSubShelfId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_SUB_SHELVES_BY_PREV_SUB_SHELF_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMySubShelvesByRootShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMySubShelvesByRootShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.subShelf.myManyByRootShelfId(
        prefetchRequest.param.rootShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMySubShelvesByRootShelfId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_SUB_SHELVES_BY_ROOT_SHELF_ID_PREFETCH" as const,
  };
};
