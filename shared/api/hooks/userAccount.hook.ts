import {
  mutationFnBindGoogleAccount,
  mutationFnUnbindGoogleAccount,
  mutationFnUpdateMyAccount,
  queryFnGetMyAccount,
} from "@shared/api/functions/userAccount.function";
import type {
  GetMyAccountRequest,
  GetMyAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { getQueryClient } from "@shared/api/queryClient";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type FetchQueryOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useGetMyAccount = (
  hookRequest?: GetMyAccountRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userAccount.my(),
    queryFn: async () => await queryFnGetMyAccount(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyAccountRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetMyAccountResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.userAccount.my(),
      queryFn: async () => await queryFnGetMyAccount(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetMyAccountResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_ACCOUNT_HOOK" as const,
  };
};

export const useUpdateMyAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyAccount,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_ACCOUNT_HOOK" as const,
  };
};

export const useBindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBindGoogleAccount,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "BIND_GOOGLE_ACCOUNT_HOOK" as const,
  };
};

export const useUnbindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUnbindGoogleAccount,
    onSuccess: (_, __) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UNBIND_GOOGLE_ACCOUNT_HOOK" as const,
  };
};
