import { NotezyAPIError } from "@shared/api/exceptions";
import { GetMyInfo, UpdateMyInfo } from "@shared/api/functions/userInfo.api";
import {
  GetMyInfoRequest,
  GetMyInfoRequestSchema,
  GetMyInfoResponse,
  UpdateMyInfoRequest,
  UpdateMyInfoRequestSchema,
} from "@shared/api/interfaces/userInfo.interface";
import { queryKeys } from "@shared/api/queryKeys";

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

export const useGetMyInfo = (
  hookRequest?: GetMyInfoRequest,
  options?: UseQueryOptions
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (request?: GetMyInfoRequest) => {
    if (!request) return;
    try {
      const validatedRequest = GetMyInfoRequestSchema.parse(request);
      const response = await GetMyInfo(validatedRequest);
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
    queryKey: queryKeys.userInfo.my(),
    queryFn: async () => await queryFunction(hookRequest),
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
      queryFn: async () => await queryFunction(callbackRequest),
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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: UpdateMyInfoRequest) => {
      const validatedRequest = UpdateMyInfoRequestSchema.parse(request);
      return await UpdateMyInfo(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userInfo.my() });
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
    name: "UPDATE_MY_INFO_HOOK" as const,
  };
};
