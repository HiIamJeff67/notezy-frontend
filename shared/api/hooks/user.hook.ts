import { NotezyAPIError } from "@shared/api/exceptions";
import { GetMe, GetUserData, UpdateMe } from "@shared/api/functions/user.api";
import {
  GetMeRequest,
  GetMeRequestSchema,
  GetUserDataRequest,
  GetUserDataRequestSchema,
  UpdateMeRequest,
  UpdateMeRequestSchema,
} from "@shared/api/interfaces/user.interface";
import { queryKeys } from "@shared/api/queryKeys";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ZodError } from "zod";

export const useGetUserData = (
  hookRequest?: GetUserDataRequest,
  options?: UseQueryOptions
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (request?: GetUserDataRequest) => {
    if (!request) return;
    try {
      const validatedRequest = GetUserDataRequestSchema.parse(request);
      return await GetUserData(validatedRequest);
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
    queryKey: queryKeys.user.data(),
    queryFn: async () => await queryFunction(hookRequest), // use the request from the param of useGetUserData()
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (callbackRequest: GetUserDataRequest) => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.user.data(),
      queryFn: async () => await queryFunction(callbackRequest), // use the request from the param of useGetUserData.queryAsync()
      staleTime: 15 * 60 * 1000,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_USER_DATA_HOOK" as const,
  };
};

export const useGetMe = (request: GetMeRequest) => {
  const query = useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      try {
        const validatedRequest = GetMeRequestSchema.parse(request);
        return await GetMe(validatedRequest);
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
    },
    staleTime: 15 * 60 * 1000, // sync with the access token expired duration
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    ...query,
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
    onSuccess: _ => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
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
