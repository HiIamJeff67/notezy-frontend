import {
  mutationFnUpdateMe,
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/functions/user.function";
import type {
  GetMeRequest,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataResponse,
} from "@shared/api/interfaces/user.interface";
import { getQueryClient } from "@shared/api/queryClient";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useGetUserData = (
  hookRequest?: GetUserDataRequest,
  options?: UseQueryOptions
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.user.data(),
    queryFn: async () => await queryFnGetUserData(hookRequest), // use the request from the param of useGetUserData()
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetUserDataRequest
  ): Promise<GetUserDataResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.user.data(),
      queryFn: async () => await queryFnGetUserData(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_USER_DATA_HOOK" as const,
  };
};

export const useGetMe = (
  hookRequest?: GetMeRequest,
  options?: UseQueryOptions
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => await queryFnGetMe(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime, // sync with the access token expired duration
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMeRequest
  ): Promise<GetMeResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.user.me(),
      queryFn: async () => await queryFnGetMe(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ME_HOOK" as const,
  };
};

export const useUpdateMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMe,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_ME_HOOK" as const,
  };
};
