import type { UUID } from "node:crypto";
import {
  mutationFnCreateNotebookMaterial,
  mutationFnCreateTextbookMaterial,
  mutationFnDeleteMyMaterialById,
  mutationFnDeleteMyMaterialsByIds,
  mutationFnMoveMyMaterialById,
  mutationFnRestoreMyMaterialById,
  mutationFnRestoreMyMaterialsByIds,
  mutationFnSaveMyNotebookMaterialById,
  mutationFnUpdateMyMaterialById,
  queryFnGetAllMyMaterialsByRootShelfId,
  queryFnGetMyMaterialAndItsParentById,
  queryFnGetMyMaterialById,
  queryFnGetMyMaterialsByParentSubShelfId,
} from "@shared/api/functions/material.function";
import type {
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdResponse,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
} from "@shared/api/interfaces/material.interface";
import { getQueryClient } from "@shared/api/queryClient";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import {
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

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
    mutationFn: mutationFnCreateTextbookMaterial,
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
    mutationFn: mutationFnSaveMyNotebookMaterialById,
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
    onSuccess: (_, variables) => {
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
