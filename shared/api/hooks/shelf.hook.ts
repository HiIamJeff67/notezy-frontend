import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateShelf,
  SynchronizeShelves,
} from "@shared/api/functions/shelf.api";
import {
  CreateShelfRequest,
  CreateShelfRequestSchema,
  SynchronizeShelvesRequest,
  SynchronizeShelvesRequestSchema,
} from "@shared/api/interfaces/shelf.interface";
import { queryKeys } from "@shared/api/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useCreateShelf = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateShelfRequest) => {
      const validatedRequest = CreateShelfRequestSchema.parse(request);
      return await CreateShelf(validatedRequest);
    },
    onSuccess: response => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shelf.myOrShared(response.data.id as UUID),
      });
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
    name: "CREATE_SHELF_HOOK" as const,
  };
};

export const useSynchronizeShelves = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: SynchronizeShelvesRequest) => {
      const validatedRequest = SynchronizeShelvesRequestSchema.parse(request);
      return await SynchronizeShelves(validatedRequest);
    },
    onSuccess: (_, variables) => {
      variables.body.shelfIds.forEach(shelfId => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.shelf.other(shelfId as UUID),
        });
      });
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
    name: "SYNCHRONIZE_SHELVES_HOOK" as const,
  };
};
