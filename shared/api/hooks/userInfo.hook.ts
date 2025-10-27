import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import { queryFnGetMyInfo } from "@shared/api/functions/userInfo.function";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  GetMyInfoRequest,
  GetMyInfoResponse,
  UpdateMyInfoRequest,
  UpdateMyInfoRequestSchema,
} from "@shared/api/interfaces/userInfo.interface";
import { UpdateMyInfo } from "@shared/api/invokers/userInfo.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ZodError } from "zod";

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
    mutationFn: async (request: UpdateMyInfoRequest) => {
      const validatedRequest = UpdateMyInfoRequestSchema.parse(request);
      return await UpdateMyInfo(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userInfo.my() });
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
    name: "UPDATE_MY_INFO_HOOK" as const,
  };
};
