import { GetMe, GetUserData, UpdateMe } from "@shared/api/functions/user.api";
import {
  GetMeRequest,
  GetMeRequestSchema,
  GetUserDataRequest,
  GetUserDataRequestSchema,
  UpdateMeRequest,
  UpdateMeRequestSchema,
} from "@shared/api/interfaces/user.interface";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ZodError } from "zod";
import { NotezyAPIError } from "../exceptions";
import { queryKeys } from "../queryKeys";

export const useGetUserData = (request: GetUserDataRequest) => {
  return useQuery({
    queryKey: queryKeys.user.data(request),
    queryFn: async () => {
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
    },
    staleTime: 15 * 60 * 1000, // sync with the access token expired duration
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 3,
    retryDelay: 500,
  });
};

export const useGetMe = (request: GetMeRequest) => {
  return useQuery({
    queryKey: queryKeys.user.me(request),
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
};

export const useUpdateMe = () => {
  return useMutation({
    mutationFn: async (request: UpdateMeRequest) => {
      const validatedRequest = UpdateMeRequestSchema.parse(request);
      return await UpdateMe(validatedRequest);
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
};
