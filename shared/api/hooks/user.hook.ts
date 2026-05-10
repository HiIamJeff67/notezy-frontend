import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  GetMeRequest,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataResponse,
} from "@shared/api/interfaces/user.interface";
import {
  mutationFnUpdateMe,
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/invokers/user.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

export const useGetUserData = (
  hookRequest?: GetUserDataRequest,
  options?: Partial<UseQueryOptions<GetUserDataResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetUserDataRequest
  ): Promise<GetUserDataResponse> => {
    try {
      if (!request) {
        throw new NotezyValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      const response = await queryFnGetUserData(request);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetUserDataResponse, Error>({
    queryKey: queryKeys.user.data(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetUserDataRequest
  ): Promise<GetUserDataResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.user.data(true),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMe = (
  hookRequest?: GetMeRequest,
  options?: Partial<UseQueryOptions<GetMeResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (request?: GetMeRequest): Promise<GetMeResponse> => {
    try {
      if (!request) {
        throw new NotezyValidationError(
          ValidationClientException.ReceivedUndefinedRequest()
        );
      }

      const response = await queryFnGetMe(request);
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      return response;
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery<GetMeResponse, Error>({
    queryKey: queryKeys.user.me(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime, // sync with the access token expired duration
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMeRequest
  ): Promise<GetMeResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.user.me(true),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useUpdateMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMe,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {},
  });

  return mutation;
};
