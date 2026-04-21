import type { UUID } from "node:crypto";
import {
  mutationFnBatchMoveMySubShelves,
  mutationFnCreateSubShelfByRootShelfId,
  mutationFnCreateSubShelvesByRootShelfIds,
  mutationFnDeleteMySubShelfById,
  mutationFnDeleteMySubShelvesByIds,
  mutationFnMoveMySubShelf,
  mutationFnMoveMySubShelves,
  mutationFnRestoreMySubShelfById,
  mutationFnRestoreMySubShelvesByIds,
  mutationFnUpdateMySubShelfById,
  mutationFnUpdateMySubShelvesByIds,
  queryFnGetAllMySubShelvesByRootShelfId,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesAndItemsByPrevSubShelfId,
  queryFnGetMySubShelvesByPrevSubShelfId,
} from "@shared/api/functions/subShelf.function";
import type {
  GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
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
  useQueryClient,
} from "@tanstack/react-query";

export const useGetMySubShelfById = (
  hookRequest?: GetMySubShelfByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subShelf.oneById(
      hookRequest?.param.subShelfId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMySubShelfById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMySubShelfByIdRequest
  ): Promise<GetMySubShelfByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.oneById(
        callbackRequest.param.subShelfId as UUID
      ),
      queryFn: async () => await queryFnGetMySubShelfById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_SUB_SHELF_BY_ID_HOOK",
  };
};

export const useGetMySubShelvesByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesByPrevSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMySubShelvesByPrevSubShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMySubShelvesByPrevSubShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_SUB_SHELVES_BY_PREV_SUB_SHELF_ID_HOOK" as const,
  };
};

export const useGetAllMySubShelvesByRootShelfId = (
  hookRequest?: GetAllMySubShelvesByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subShelf.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetAllMySubShelvesByRootShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMySubShelvesByRootShelfIdRequest
  ): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMySubShelvesByRootShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_SUB_SHELVES_BY_ROOT_SHELF_ID_HOOK" as const,
  };
};

export const useGetMySubShelvesAndItemsByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_SUB_SHELVES_AND_ITEMS_BY_PREV_SUB_SHELF_ID_HOOK",
    isAbandon: true,
  };
};

export const useCreateSubShelfByRootShelfId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateSubShelfByRootShelfId,
    onSuccess: (_, variables) => {
      const prevSubShelfId = variables.affected.prevSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
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
    name: "CREATE_SUB_SHELF_BY_ROOT_SHELF_ID_HOOK" as const,
  };
};

export const useCreateSubShelvesByRootShelfIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateSubShelvesByRootShelfIds,
    onSuccess: (_, variables) => {
      const prevSubShelfIds = variables.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = variables.affected.rootShelfIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
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
    name: "CREATE_SUB_SHELVES_BY_ROOT_SHELF_IDS_HOOK" as const,
  };
};

export const useUpdateMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMySubShelfById,
    onSuccess: (_, variables) => {
      const prevSubShelfId = variables.affected.prevSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
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
    name: "UPDATE_MY_SUB_SHELF_BY_ID_HOOK" as const,
  };
};
export const useUpdateMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMySubShelvesByIds,
    onSuccess: (_, variables) => {
      const prevSubShelfIds = variables.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = variables.affected.rootShelfIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
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
    name: "UPDATE_MY_SUB_SHELVES_BY_IDS_HOOK" as const,
  };
};

export const useMoveMySubShelf = () => {
  const queryClient = getQueryClient();
  const mutation = useMutation({
    mutationFn: mutationFnMoveMySubShelf,
    onSuccess: (_, variables) => {
      const sourceSubShelfId = variables.body.sourceSubShelfId as UUID;
      const destinationSubShelfId = variables.body
        .destinationSubShelfId as UUID | null;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const childSubShelfIds = (
        variables.affected.childSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        ...childSubShelfIds.map(childSubShelfId =>
          queryKeys.subShelf.oneById(childSubShelfId)
        ),
        queryKeys.subShelf.oneById(sourceSubShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
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
    name: "MOVE_MY_SUB_SHELF_HOOK" as const,
  };
};

export const useMoveMySubShelves = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMySubShelves,
    onSuccess: (_, variables) => {
      const sourceSubShelfIds = (variables.body.sourceSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const destinationSubShelfId = variables.body
        .destinationSubShelfId as UUID;
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const childSubShelfIds = (
        variables.affected.childSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...sourceSubShelfIds.map(sourceSubShelfId =>
          queryKeys.subShelf.oneById(sourceSubShelfId)
        ),
        queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId),
        ...childSubShelfIds.map(childSubShelfId =>
          queryKeys.subShelf.oneById(childSubShelfId)
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
    name: "MOVE_MY_SUB_SHELVES_HOOK" as const,
  };
};

export const useBatchMoveMySubShelves = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBatchMoveMySubShelves,
    onSuccess: (_, variables) => {
      const sourceSubShelfIds = [] as UUID[];
      const destinationSubShelfIds = [] as UUID[];
      for (const movedSubShelf of variables.body.movedSubShelves) {
        sourceSubShelfIds.push(...(movedSubShelf.sourceSubShelfIds as UUID[]));
        destinationSubShelfIds.push(
          movedSubShelf.destinationSubShelfId as UUID
        );
      }
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const childSubShelfIds = (
        variables.affected.childSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...sourceSubShelfIds.map(sourceSubShelfId =>
          queryKeys.subShelf.oneById(sourceSubShelfId)
        ),
        ...destinationSubShelfIds.map(destinationSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(destinationSubShelfId)
        ),
        ...childSubShelfIds.map(childSubShelfId =>
          queryKeys.subShelf.oneById(childSubShelfId)
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
    name: "BATCH_MOVE_MY_SUB_SHELVES_HOOK" as const,
  };
};

export const useRestoreMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMySubShelfById,
    onSuccess: (_, variables) => {
      const subShelfId = variables.body.subShelfId as UUID;
      const prevSubShelfId = variables.affected.prevSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(subShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(subShelfId),
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
    name: "RESTORE_MY_SUB_SHELF_BY_ID_HOOK" as const,
  };
};
export const useRestoreMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMySubShelvesByIds,
    onSuccess: (_, variables) => {
      const subShelfIds = (variables.body.subShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const prevSubShelfIds = (variables.affected.prevSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...subShelfIds.flatMap(subShelfId => [
          queryKeys.subShelf.oneById(subShelfId),
          queryKeys.material.manyByParentSubShelfId(subShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
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
    name: "RESTORE_MY_SUB_SHELVES_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMySubShelfById,
    onSuccess: (_, variables) => {
      const subShelfId = variables.body.subShelfId as UUID;
      const prevSubShelfId = variables.affected.prevSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(subShelfId),
        queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId),
        queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        queryKeys.material.manyByParentSubShelfId(subShelfId),
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
    name: "DELETE_MY_SUB_SHELF_BY_ID_HOOK" as const,
  };
};

export const useDeleteMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMySubShelvesByIds,
    onSuccess: (_, variables) => {
      const subShelfIds = (variables.body.subShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const prevSubShelfIds = (variables.affected.prevSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.subShelf.manyByRootShelfId(rootShelfId),
        ]),
        ...subShelfIds.flatMap(subShelfId => [
          queryKeys.subShelf.oneById(subShelfId),
          queryKeys.material.manyByParentSubShelfId(subShelfId),
        ]),
        ...prevSubShelfIds.map(prevSubShelfId =>
          queryKeys.subShelf.manyByPrevSubShelfId(prevSubShelfId)
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
    name: "DELETE_MY_SUB_SHELVES_BY_IDS_HOOK" as const,
  };
};
