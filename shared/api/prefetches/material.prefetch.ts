import {
  queryFnGetAllMyMaterialsByParentSubShelfId,
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
} from "@shared/api/functions/material.function";
import {
  GetAllMyMaterialsByParentSubShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetMyMaterialByIdRequest,
} from "@shared/api/interfaces/material.interface";
import { PrefetchQueryDefaultOptions } from "@shared/api/interfaces/queryHookOptions";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";

export const prefetchGetMyMaterialById = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyMaterialByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.myOneById(
        prefetchRequest.param.materialId as UUID
      ),
      queryFn: async () => queryFnGetMyMaterialById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_MATERIAL_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetMyMaterialAndItsParentById = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMyMaterialByIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.myOneById(
        prefetchRequest.param.materialId as UUID
      ),
      queryFn: async () =>
        queryFnGetMyMaterialAndItsParentById(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_MY_MATERIAL_AND_ITS_PARENT_BY_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMyMaterialsByParentSubShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMyMaterialsByParentSubShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.myManyByParentSubShelfId(
        prefetchRequest.param.parentSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMyMaterialsByParentSubShelfId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_MATERIALS_BY_PARENT_SUB_SHELF_ID_PREFETCH" as const,
  };
};

export const prefetchGetAllMyMaterialsByRootShelfId = (
  initialQueryClient?: QueryClient
) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetAllMyMaterialsByRootShelfIdRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.material.myManyByRootShelfId(
        prefetchRequest.param.rootShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMyMaterialsByRootShelfId(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ALL_MY_MATERIALS_BY_ROOT_SHELF_ID_PREFETCH" as const,
  };
};
