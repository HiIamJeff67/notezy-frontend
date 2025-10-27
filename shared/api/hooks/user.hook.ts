import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetMe,
  queryFnGetUserData,
} from "@shared/api/functions/user.function";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  GetMeRequest,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataResponse,
  UpdateMeRequest,
  UpdateMeRequestSchema,
} from "@shared/api/interfaces/user.interface";
import { UpdateMe } from "@shared/api/invokers/user.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ZodError } from "zod";

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
      queryFn: async () => await queryFnGetUserData(callbackRequest), // use the request from the param of useGetUserData.queryAsync()
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
    mutationFn: async (request: UpdateMeRequest) => {
      const validatedRequest = UpdateMeRequestSchema.parse(request);
      return await UpdateMe(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_ME_HOOK" as const,
  };
};
