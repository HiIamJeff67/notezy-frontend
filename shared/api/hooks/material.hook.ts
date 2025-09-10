import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateTextbookMaterial,
  DeleteMyMaterialById,
  DeleteMyMaterialsByIds,
  GetMyMaterialById,
  MoveMyMaterialById,
  RestoreMyMaterialById,
  RestoreMyMaterialsByIds,
  SaveMyMaterialById,
  SearchMyMaterialsByShelfIds,
} from "@shared/api/functions/material.api";
import {
  CreateMaterialRequest,
  CreateMaterialRequestSchema,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdRequestSchema,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdRequestSchema,
  SearchMyMaterialsByShelfIdsRequest,
  SearchMyMaterialsByShelfIdsRequestSchema,
} from "@shared/api/interfaces/material.interface";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";
import { queryKeys } from "../queryKeys";

export const useGetMyMaterialById = (
  hookRequest?: GetMyMaterialByIdRequest,
  options?: UseQueryOptions
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (request?: GetMyMaterialByIdRequest) => {
    if (!request) return;
    try {
      const validatedRequest = GetMyMaterialByIdRequestSchema.parse(request);
      return await GetMyMaterialById(validatedRequest);
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
    queryKey: queryKeys.material.myOneOrSharedOne(
      hookRequest?.body.materialId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (callbackRequest: GetMyMaterialByIdRequest) => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.myOneOrSharedOne(
        callbackRequest.body.materialId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: 15 * 60 * 1000,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_MATERIAL_BY_ID" as const,
  };
};

export const useSearchMyMaterialsByShelfId = (
  hookRequest?: SearchMyMaterialsByShelfIdsRequest,
  options?: UseQueryOptions
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (
    request?: SearchMyMaterialsByShelfIdsRequest
  ) => {
    if (!request) return;
    try {
      const validatedRequest =
        SearchMyMaterialsByShelfIdsRequestSchema.parse(request);
      return await SearchMyMaterialsByShelfIds(validatedRequest);
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
    queryKey: queryKeys.material.myManyOrSharedMany(
      hookRequest?.body.rootShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (callbackRequest: GetMyMaterialByIdRequest) => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.myManyOrSharedMany(
        callbackRequest.body.rootShelfId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: 15 * 60 * 1000,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "SEARCH_MY_MATERIALS_BY_SHELF_ID" as const,
  };
};

export const useCreateTextbookMaterial = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateMaterialRequest) => {
      const validatedRequest = CreateMaterialRequestSchema.parse(request);
      return await CreateTextbookMaterial(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myManyOrSharedMany(
          variables.body.rootShelfId as UUID
        ),
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
    name: "CREATE_TEXTBOOK_MATERIAL" as const,
  };
};

export const useSaveMyMaterialById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: SaveMyMaterialByIdRequest) => {
      const validatedRequest = SaveMyMaterialByIdRequestSchema.parse(request);
      return await SaveMyMaterialById(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myOneOrSharedOne(
          variables.body.materialId as UUID
        ),
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
    name: "SAVE_MY_MATERIAL_BY_ID" as const,
  };
};

export const useMoveMyMaterialById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: MoveMyMaterialByIdRequest) => {
      const validatedRequest = MoveMyMaterialByIdRequestSchema.parse(request);
      return await MoveMyMaterialById(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myOneOrSharedOne(
          variables.body.materialId as UUID
        ),
      });
      // we don't update the apollo cached shelves here
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
    name: "MOVE_MY_MATERIAL_BY_ID" as const,
  };
};

export const useRestoreMyMaterialById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RestoreMyMaterialByIdRequest) => {
      const validatedRequest =
        RestoreMyMaterialByIdRequestSchema.parse(request);
      return await RestoreMyMaterialById(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myManyOrSharedMany(
          variables.body.rootShelfId as UUID
        ),
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
    name: "RESTORE_MY_MATERIAL_BY_ID" as const,
  };
};

export const useRestoreMyMaterialsByIds = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RestoreMyMaterialsByIdsRequest) => {
      const validatedRequest =
        RestoreMyMaterialsByIdsRequestSchema.parse(request);
      return await RestoreMyMaterialsByIds(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myManyOrSharedMany(
          variables.body.rootShelfId as UUID
        ),
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
    name: "RESTORE_MY_MATERIALS_BY_IDS" as const,
  };
};

export const useDeleteMyMaterialById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMyMaterialByIdRequest) => {
      const validatedRequest = DeleteMyMaterialByIdRequestSchema.parse(request);
      return await DeleteMyMaterialById(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myOneOrSharedOne(
          variables.body.materialId as UUID
        ),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myManyOrSharedMany(
          variables.body.rootShelfId as UUID
        ),
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
    name: "DELETE_MY_MATERIAL_BY_ID" as const,
  };
};

export const useDeleteMyMaterialsByIds = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMyMaterialsByIdsRequest) => {
      const validatedRequest =
        DeleteMyMaterialsByIdsRequestSchema.parse(request);
      return await DeleteMyMaterialsByIds(validatedRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.material.myManyOrSharedMany(
          variables.body.rootShelfId as UUID
        ),
      });
      variables.body.materialIds.forEach((materialId, index) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.material.myOneOrSharedOne(materialId as UUID),
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
    name: "DELETE_MY_MATERIALS_BY_IDS" as const,
  };
};
