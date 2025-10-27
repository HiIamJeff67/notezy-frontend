import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetAllMyMaterialsByParentSubShelfId,
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialById,
} from "@shared/api/functions/material.function";
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
  GetAllMyMaterialsByParentSubShelfIdResponse,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdResponse,
  GetMyMaterialByIdRequest,
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
import {
  CreateNotebookMaterial,
  CreateTextbookMaterial,
  DeleteMyMaterialById,
  DeleteMyMaterialsByIds,
  MoveMyMaterialById,
  RestoreMyMaterialById,
  RestoreMyMaterialsByIds,
  SaveMyNotebookMaterialById,
  UpdateMyMaterialById,
} from "@shared/api/invokers/material.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useGetMyMaterialById = (
  hookRequest?: GetMyMaterialByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.material.myOneById(
      hookRequest?.param.materialId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyMaterialById(hookRequest),
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
      queryFn: async () => await queryFnGetMyMaterialById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useGetAllMyMaterialsByParentSubShelfId = (
  hookRequest?: GetAllMyMaterialsByParentSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.material.myManyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetAllMyMaterialsByParentSubShelfId(hookRequest),
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
      queryFn: async () =>
        await queryFnGetAllMyMaterialsByParentSubShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_MATERIALS_BY_PARENT_SUB_SHELF_ID_HOOK" as const,
  };
};

export const useGetAllMyMaterialsByRootShelfId = (
  hookRequest?: GetAllMyMaterialsByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.material.myManyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetAllMyMaterialsByRootShelfId(hookRequest),
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
      queryFn: async () =>
        await queryFnGetAllMyMaterialsByRootShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_MATERIALS_BY_ROOT_SHELF_ID_HOOK" as const,
  };
};

export const useCreateTextbookMaterial = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateTextbookMaterialRequest) => {
      const validatedRequest =
        CreateTextbookMaterialRequestSchema.parse(request);
      return await CreateTextbookMaterial(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "CREATE_TEXTBOOK_MATERIAL_HOOK" as const,
  };
};

export const useCreateNotebookMaterial = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: CreateNotebookMaterialRequest) => {
      const validatedRequest =
        CreateNotebookMaterialRequestSchema.parse(request);
      return await CreateNotebookMaterial(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "CREATE_NOTEBOOK_MATERIAL_HOOK" as const,
  };
};

export const useUpdateMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: UpdateMyMaterialByIdRequest) => {
      const validatedRequest = UpdateMyMaterialByIdRequestSchema.parse(request);
      return await UpdateMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "UPDATE_MY_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useSaveMyNotebookMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: SaveMyNotebookMaterialByIdRequest) => {
      const validatedRequest =
        SaveMyNotebookMaterialByIdRequestSchema.parse(request);
      return await SaveMyNotebookMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "SAVE_MY_NOTEBOOK_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useMoveMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: MoveMyMaterialByIdRequest) => {
      const validatedRequest = MoveMyMaterialByIdRequestSchema.parse(request);
      return await MoveMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "MOVE_MY_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RestoreMyMaterialByIdRequest) => {
      const validatedRequest =
        RestoreMyMaterialByIdRequestSchema.parse(request);
      return await RestoreMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "RESTORE_MY_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyMaterialsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RestoreMyMaterialsByIdsRequest) => {
      const validatedRequest =
        RestoreMyMaterialsByIdsRequestSchema.parse(request);
      return await RestoreMyMaterialsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "RESTORE_MY_MATERIALS_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMyMaterialById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMyMaterialByIdRequest) => {
      const validatedRequest = DeleteMyMaterialByIdRequestSchema.parse(request);
      return await DeleteMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "DELETE_MY_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useDeleteMyMaterialsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMyMaterialsByIdsRequest) => {
      const validatedRequest =
        DeleteMyMaterialsByIdsRequestSchema.parse(request);
      return await DeleteMyMaterialsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "DELETE_MY_MATERIALS_BY_IDS_HOOK" as const,
  };
};
