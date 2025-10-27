import {
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/functions/user.function";
import { PrefetchQueryDefaultOptions } from "@shared/api/interfaces/queryHookOptions";
import {
  GetMeRequest,
  GetUserDataRequest,
} from "@shared/api/interfaces/user.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { QueryClient } from "@tanstack/react-query";

export const prefetchGetUserData = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetUserDataRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.data(),
      queryFn: async () => await queryFnGetUserData(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_USER_DATA_PREFETCH" as const,
  };
};

export const prefetchGetMe = (initialQueryClient?: QueryClient) => {
  const queryClient = initialQueryClient ?? getQueryClient();

  const prefetchQuery = async (
    prefetchRequest: GetMeRequest
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.me(),
      queryFn: async () => await queryFnGetMe(prefetchRequest, true),
      staleTime: PrefetchQueryDefaultOptions.staleTime as number,
    });
  };

  return {
    prefetchQuery: prefetchQuery,
    nextQueryClient: queryClient,
    name: "GET_ME_PREFETCH" as const,
  };
};
