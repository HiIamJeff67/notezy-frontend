import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { GetMe, GetUserData, UpdateMe } from "@shared/api/functions/user.api";
import {
  GetMeRequest,
  GetMeRequestSchema,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataRequestSchema,
  GetUserDataResponse,
  UpdateMeRequest,
  UpdateMeRequestSchema,
} from "@shared/api/interfaces/user.interface";
import { queryKeys } from "@shared/api/queryKeys";
import { tKey } from "@shared/translations";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ZodError } from "zod";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "../interfaces/queryHookOptions";

export const useGetUserData = (
  hookRequest?: GetUserDataRequest,
  options?: UseQueryOptions
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (request?: GetUserDataRequest) => {
    if (!request) return;

    try {
      const validatedRequest = GetUserDataRequestSchema.parse(request);
      const response = await GetUserData(validatedRequest);
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
      return response;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.user.notFound:
            throw new Error(tKey.error.apiError.getUser.failedToGetUser);
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    }
  };

  const query = useQuery({
    queryKey: queryKeys.user.data(),
    queryFn: async () => await queryFunction(hookRequest), // use the request from the param of useGetUserData()
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
      queryFn: async () => await queryFunction(callbackRequest), // use the request from the param of useGetUserData.queryAsync()
      staleTime: QueryAsyncDefaultOptions.staleTime as number as number,
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
  const queryClient = useQueryClient();

  const queryFunction = async (request?: GetMeRequest) => {
    if (!request) return;
    try {
      const validatedRequest = GetMeRequestSchema.parse(request);
      const response = await GetMe(validatedRequest);
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
          response.newAccessToken
        );
      }
      return response;
    } catch (error) {
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
    }
  };

  const query = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => await queryFunction(hookRequest),
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
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ME_HOOK" as const,
  };
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: UpdateMeRequest) => {
      const validatedRequest = UpdateMeRequestSchema.parse(request);
      return await UpdateMe(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      if (response.newAccessToken) {
        localStorage.removeItem(LocalStorageKeys.AccessToken);
        localStorage.setItem(
          LocalStorageKeys.AccessToken,
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
