import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateNotebookMaterial,
  CreateTextbookMaterial,
  DeleteMyMaterialById,
  DeleteMyMaterialsByIds,
  GetAllMyMaterialsByParentSubShelfId,
  GetAllMyMaterialsByRootShelfId,
  GetMyMaterialById,
  MoveMyMaterialById,
  RestoreMyMaterialById,
  RestoreMyMaterialsByIds,
  SaveMyNotebookMaterialById,
  UpdateMyMaterialById,
} from "@shared/api/functions/material.api";
import {
  CreateNotebookMaterialRequest,
  CreateNotebookMaterialRequestSchema,
  CreateTextbookMaterialRequest,
  CreateTextbookMaterialRequestSchema,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  GetAllMyMaterialsByParentSubShelfIdRequest,
  GetAllMyMaterialsByParentSubShelfIdRequestSchema,
  GetAllMyMaterialsByParentSubShelfIdResponse,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdRequestSchema,
  GetAllMyMaterialsByRootShelfIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdRequestSchema,
  GetMyMaterialByIdResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  SaveMyNotebookMaterialByIdRequest,
  SaveMyNotebookMaterialByIdRequestSchema,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdRequestSchema,
} from "@shared/api/interfaces/material.interface";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useGetMyMaterialById = (
  hookRequest?: GetMyMaterialByIdRequest,
  options?: Partial<UseQueryOptions>
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
    queryKey: queryKeys.material.myOneById(
      hookRequest?.param.materialId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyMaterialByIdRequest
  ): Promise<GetMyMaterialByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.myOneById(
        callbackRequest.param.materialId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_MATERIAL_BY_ID" as const,
  };
};

export const useGetAllMyMaterialsByParentSubShelfId = (
  hookRequest?: GetAllMyMaterialsByParentSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (
    request?: GetAllMyMaterialsByParentSubShelfIdRequest
  ) => {
    if (!request) return;

    try {
      const validatedRequest =
        GetAllMyMaterialsByParentSubShelfIdRequestSchema.parse(request);
      return await GetAllMyMaterialsByParentSubShelfId(validatedRequest);
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
    queryKey: queryKeys.material.myManyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMyMaterialsByParentSubShelfIdRequest
  ): Promise<GetAllMyMaterialsByParentSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.myManyByParentSubShelfId(
        callbackRequest.param.parentSubShelfId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_MATERIALS_BY_PARENT_SUB_SHELF_ID" as const,
  };
};

export const useGetAllMyMaterialsByRootShelfId = (
  hookRequest?: GetAllMyMaterialsByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = useQueryClient();

  const queryFunction = async (
    request?: GetAllMyMaterialsByRootShelfIdRequest
  ) => {
    if (!request) return;

    try {
      const validatedRequest =
        GetAllMyMaterialsByRootShelfIdRequestSchema.parse(request);
      return await GetAllMyMaterialsByRootShelfId(validatedRequest);
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
    queryKey: queryKeys.material.myManyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFunction(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMyMaterialsByRootShelfIdRequest
  ): Promise<GetAllMyMaterialsByRootShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.myManyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID
      ),
      queryFn: async () => await queryFunction(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_MATERIALS_BY_ROOT_SHELF_ID" as const,
  };
};

export const useCreateTextbookMaterial = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateTextbookMaterialRequest) => {
      const validatedRequest =
        CreateTextbookMaterialRequestSchema.parse(request);
      return await CreateTextbookMaterial(validatedRequest);
    },
    onSuccess: (_, variables) => {
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return false;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return false;
            case "material":
              switch (k[1]) {
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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

export const useCreateNotebookMaterial = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateNotebookMaterialRequest) => {
      const validatedRequest =
        CreateNotebookMaterialRequestSchema.parse(request);
      return await CreateNotebookMaterial(validatedRequest);
    },
    onSuccess: (_, variables) => {
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return false;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return false;
            case "material":
              switch (k[1]) {
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
    name: "CREATE_NOTEBOOK_MATERIAL" as const,
  };
};

export const useUpdateMyMaterialById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: UpdateMyMaterialByIdRequest) => {
      const validatedRequest = UpdateMyMaterialByIdRequestSchema.parse(request);
      return await UpdateMyMaterialById(validatedRequest);
    },
    onSuccess: (_, variables) => {
      const materialId = variables.body.materialId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
    name: "UPDATE_MY_MATERIAL_BY_ID" as const,
  };
};

export const useSaveMyNotebookMaterialById = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: SaveMyNotebookMaterialByIdRequest) => {
      const validatedRequest =
        SaveMyNotebookMaterialByIdRequestSchema.parse(request);
      return await SaveMyNotebookMaterialById(validatedRequest);
    },
    onSuccess: (_, variables) => {
      const materialId = variables.body.materialId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
    name: "SAVE_MY_NOTEBOOK_MATERIAL_BY_ID" as const,
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
      const materialId = variables.body.materialId;
      const destinationParentSubShelfId =
        variables.body.destinationParentSubShelfId;
      const sourceParentSubShelfId = variables.affected.sourceParentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              if (
                k[1] === "myOneById" &&
                (sourceParentSubShelfId === k[2] ||
                  destinationParentSubShelfId === k[2])
              )
                return true;
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (
                    sourceParentSubShelfId === k[2] ||
                    destinationParentSubShelfId === k[2]
                  )
                    return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
      const materialId = variables.body.materialId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return true;
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
      const materialIdsSet = new Set(
        (variables.body.materialIds || []).filter(Boolean) as UUID[]
      );
      const parentSubShelfIdsSet = new Set(
        (variables.affected.parentSubShelfIds || []).filter(Boolean) as UUID[]
      );
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k)) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfIdsSet.has(k[2]))
                return true;
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialIdsSet.has(k[2])) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfIdsSet.has(k[2])) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
      const materialId = variables.body.materialId;
      const parentSubShelfId = variables.affected.parentSubShelfId;
      const rootShelfId = variables.affected.rootShelfId;
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k) || k.length < 3) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfId === k[2]) return true;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfId === k[2])
                return true;
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialId === k[2]) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfId === k[2]) return true;
                case "myManyByRootShelfId":
                  if (rootShelfId === k[2]) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
      const materialIdsSet = new Set(
        (variables.body.materialIds || []).filter(Boolean) as UUID[]
      );
      const parentSubShelfIdsSet = new Set(
        (variables.affected.parentSubShelfIds || []).filter(Boolean) as UUID[]
      );
      const rootShelfIdsSet = new Set(
        (variables.affected.rootShelfIds || []).filter(Boolean) as UUID[]
      );
      queryClient.invalidateQueries({
        predicate: q => {
          const k = q.queryKey as any[];
          if (!Array.isArray(k)) return false;

          switch (k[0]) {
            case "rootShelf":
              if (k[1] === "myOneById" && rootShelfIdsSet.has(k[2]))
                return true;
            case "subShelf":
              if (k[1] === "myOneById" && parentSubShelfIdsSet.has(k[2]))
                return true;
            case "material":
              switch (k[1]) {
                case "myOneById":
                  if (materialIdsSet.has(k[2])) return true;
                case "myManyByParentSubShelfId":
                  if (parentSubShelfIdsSet.has(k[2])) return true;
                case "myManyByRootShelfId":
                  if (rootShelfIdsSet.has(k[2])) return true;
              }
          }

          return false;
        },
        refetchType: "active",
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
