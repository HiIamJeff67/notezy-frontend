import {
  mutationFnUpdateMyInfo,
  queryFnGetMyInfo,
} from "@shared/api/functions/userInfo.function";
import type {
  GetMyInfoRequest,
  GetMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
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

export const useGetMyInfo = (
  hookRequest?: GetMyInfoRequest,
  options?: UseQueryOptions
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userInfo.my(),
    queryFn: async () => await queryFnGetMyInfo(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyInfoRequest
  ): Promise<GetMyInfoResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.userInfo.my(),
      queryFn: async () => await queryFnGetMyInfo(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_INFO_HOOK" as const,
  };
};

export const useUpdateMyInfo = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyInfo,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userInfo.my() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_INFO_HOOK" as const,
  };
};
