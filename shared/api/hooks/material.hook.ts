import type { UUID } from "node:crypto";
import { NotezyAPIError } from "@shared/api/exceptions";
import { SaveMyNotebookMaterialById } from "@shared/api/functions/material.clientFn";
import {
  type GetAllMyMaterialsByRootShelfIdRequest,
  type GetMyMaterialAndItsParentByIdRequest,
  type GetMyMaterialByIdRequest,
  type GetMyMaterialsByParentSubShelfIdRequest,
  type SaveMyNotebookMaterialByIdRequest,
  SaveMyNotebookMaterialByIdRequestSchema,
  SaveMyNotebookMaterialByIdResponseSchema,
} from "@shared/api/interfaces/material.interface";
import {
  mutationFnCreateNotebookMaterial,
  mutationFnCreateTextbookMaterial,
  mutationFnDeleteMyMaterialById,
  mutationFnDeleteMyMaterialsByIds,
  mutationFnMoveMyMaterialById,
  mutationFnRestoreMyMaterialById,
  mutationFnRestoreMyMaterialsByIds,
  mutationFnUpdateMyMaterialById,
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
} from "@shared/api/invokers/material.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { ZodError } from "zod";

export const useGetMyMaterialById = (
  hookRequest: GetMyMaterialByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.material.oneById(
      hookRequest.param.materialId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyMaterialById(
        hookRequest as GetMyMaterialByIdRequest
      );
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_MY_MATERIAL_BY_ID_HOOK" as const,
  };
};

export const useGetMyMaterialAndItsParentById = (
  hookRequest: GetMyMaterialAndItsParentByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.material.oneById(
      hookRequest.param.materialId as UUID | undefined,
      true
    ),
    queryFn: async () => {
      const response = await queryFnGetMyMaterialAndItsParentById(
        hookRequest as GetMyMaterialAndItsParentByIdRequest
      );
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_MY_MATERIAL_AND_ITS_PARENT_BY_ID_HOOK" as const,
  };
};

export const useGetMyMaterialsByParentSubShelfId = (
  hookRequest: GetMyMaterialsByParentSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.material.manyByParentSubShelfId(
      hookRequest.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetMyMaterialsByParentSubShelfId(
        hookRequest as GetMyMaterialsByParentSubShelfIdRequest
      );
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_ALL_MY_MATERIALS_BY_PARENT_SUB_SHELF_ID_HOOK" as const,
  };
};

export const useGetAllMyMaterialsByRootShelfId = (
  hookRequest: GetAllMyMaterialsByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const query = useQuery({
    queryKey: queryKeys.material.manyByRootShelfId(
      hookRequest.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => {
      const response = await queryFnGetAllMyMaterialsByRootShelfId(
        hookRequest as GetAllMyMaterialsByRootShelfIdRequest
      );
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      return response;
    },
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  return {
    ...query,
    name: "GET_ALL_MY_MATERIALS_BY_ROOT_SHELF_ID_HOOK" as const,
  };
};

export const useCreateTextbookMaterial = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateTextbookMaterial,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    },
    onError: error => {
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
    mutationFn: mutationFnCreateNotebookMaterial,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    },
    onError: error => {
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
    mutationFn: mutationFnUpdateMyMaterialById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    },
    onError: error => {
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
    // since the SaveMyNotebookMaterialById is a client only function, we define it here directly
    mutationFn: async (request: SaveMyNotebookMaterialByIdRequest) => {
      try {
        const validatedRequest =
          SaveMyNotebookMaterialByIdRequestSchema.parse(request);
        const response = await SaveMyNotebookMaterialById(validatedRequest);
        return SaveMyNotebookMaterialByIdResponseSchema.parse(response);
      } catch (error) {
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
      }
    },
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.material.oneById(materialId),
        queryKeys.material.manyByParentSubShelfId(parentSubShelfId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {
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
    mutationFn: mutationFnMoveMyMaterialById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialId = request.body.materialId as UUID;
      const destinationParentSubShelfId = request.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfId = request.affected
        .sourceParentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    },
    onError: error => {
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
    mutationFn: mutationFnRestoreMyMaterialById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    },
    onError: error => {
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
    mutationFn: mutationFnRestoreMyMaterialsByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialIds = (request.body.materialIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        request.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
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
    },
    onError: error => {
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
    mutationFn: mutationFnDeleteMyMaterialById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialId = request.body.materialId as UUID;
      const parentSubShelfId = request.affected.parentSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    },
    onError: error => {
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
    mutationFn: mutationFnDeleteMyMaterialsByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.embeddedPublicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.embeddedPublicId
      );
      const materialIds = (request.body.materialIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        request.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
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
    },
    onError: error => {
      throw error;
    },
  });

  return {
    ...mutation,
    name: "DELETE_MY_MATERIALS_BY_IDS_HOOK" as const,
  };
};
