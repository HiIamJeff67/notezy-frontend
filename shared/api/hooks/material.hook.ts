import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
} from "@shared/api/functions/material.function";
import {
  CreateNotebookMaterialRequest,
  CreateNotebookMaterialRequestSchema,
  CreateNotebookMaterialResponse,
  CreateTextbookMaterialRequest,
  CreateTextbookMaterialRequestSchema,
  CreateTextbookMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  DeleteMyMaterialsByIdsResponse,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdResponse,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  MoveMyMaterialByIdResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  RestoreMyMaterialsByIdsResponse,
  SaveMyNotebookMaterialByIdRequest,
  SaveMyNotebookMaterialByIdRequestSchema,
  SaveMyNotebookMaterialByIdResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdRequestSchema,
  UpdateMyMaterialByIdResponse,
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
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  QueryKey,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useGetMyMaterialById = (
  hookRequest?: GetMyMaterialByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.material.oneById(
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
      queryKey: queryKeys.material.oneById(
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

export const useGetMyMaterialAndItsParentById = (
  hookRequest?: GetMyMaterialAndItsParentByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.material.oneById(
      hookRequest?.param.materialId as UUID | undefined,
      true
    ),
    queryFn: async () =>
      await queryFnGetMyMaterialAndItsParentById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyMaterialAndItsParentByIdRequest
  ): Promise<GetMyMaterialAndItsParentByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.oneById(
        callbackRequest.param.materialId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyMaterialAndItsParentById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_MATERIAL_AND_ITS_PARENT_BY_ID_HOOK" as const,
  };
};

export const useGetMyMaterialsByParentSubShelfId = (
  hookRequest?: GetMyMaterialsByParentSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.material.manyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyMaterialsByParentSubShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyMaterialsByParentSubShelfIdRequest
  ): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.material.manyByParentSubShelfId(
        callbackRequest.param.parentSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyMaterialsByParentSubShelfId(callbackRequest),
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
    queryKey: queryKeys.material.manyByRootShelfId(
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
      queryKey: queryKeys.material.manyByRootShelfId(
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
    mutationFn: async (
      request: CreateTextbookMaterialRequest
    ): Promise<CreateTextbookMaterialResponse> => {
      const validatedRequest =
        CreateTextbookMaterialRequestSchema.parse(request);
      return await CreateTextbookMaterial(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: CreateNotebookMaterialRequest
    ): Promise<CreateNotebookMaterialResponse> => {
      const validatedRequest =
        CreateNotebookMaterialRequestSchema.parse(request);
      return await CreateNotebookMaterial(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: UpdateMyMaterialByIdRequest
    ): Promise<UpdateMyMaterialByIdResponse> => {
      const validatedRequest = UpdateMyMaterialByIdRequestSchema.parse(request);
      return await UpdateMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialId = variables.body.materialId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: SaveMyNotebookMaterialByIdRequest
    ): Promise<SaveMyNotebookMaterialByIdResponse> => {
      const validatedRequest =
        SaveMyNotebookMaterialByIdRequestSchema.parse(request);
      return await SaveMyNotebookMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialId = variables.body.materialId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: MoveMyMaterialByIdRequest
    ): Promise<MoveMyMaterialByIdResponse> => {
      const validatedRequest = MoveMyMaterialByIdRequestSchema.parse(request);
      return await MoveMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialId = variables.body.materialId as UUID;
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfId = variables.affected
        .sourceParentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(sourceParentSubShelfId),
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(sourceParentSubShelfId),
        queryKeys.material.manyByParentSubShelfId(destinationParentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: RestoreMyMaterialByIdRequest
    ): Promise<RestoreMyMaterialByIdResponse> => {
      const validatedRequest =
        RestoreMyMaterialByIdRequestSchema.parse(request);
      return await RestoreMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialId = variables.body.materialId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: RestoreMyMaterialsByIdsRequest
    ): Promise<RestoreMyMaterialsByIdsResponse> => {
      const validatedRequest =
        RestoreMyMaterialsByIdsRequestSchema.parse(request);
      return await RestoreMyMaterialsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialIds = (variables.body.materialIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.map(parentSubShelfId =>
          queryKeys.material.manyByParentSubShelfId(parentSubShelfId)
        ),
        ...materialIds.map(materialId =>
          queryKeys.material.oneById(materialId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: DeleteMyMaterialByIdRequest
    ): Promise<DeleteMyMaterialByIdResponse> => {
      const validatedRequest = DeleteMyMaterialByIdRequestSchema.parse(request);
      return await DeleteMyMaterialById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialId = variables.body.materialId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.material.manyByRootShelfId(rootShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
    mutationFn: async (
      request: DeleteMyMaterialsByIdsRequest
    ): Promise<DeleteMyMaterialsByIdsResponse> => {
      const validatedRequest =
        DeleteMyMaterialsByIdsRequestSchema.parse(request);
      return await DeleteMyMaterialsByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const materialIds = (variables.body.materialIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.material.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.map(parentSubShelfId =>
          queryKeys.material.manyByParentSubShelfId(parentSubShelfId)
        ),
        ...materialIds.map(materialId =>
          queryKeys.material.oneById(materialId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
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
      } else if (error instanceof NotezyAPIError) {
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
