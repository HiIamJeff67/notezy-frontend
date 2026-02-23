import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetAllMySubShelvesByRootShelfId,
  queryFnGetMySubShelfById,
  queryFnGetMySubShelvesAndItemsByPrevSubShelfId,
  queryFnGetMySubShelvesByPrevSubShelfId,
} from "@shared/api/functions/subShelf.function";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdRequestSchema,
  CreateSubShelfByRootShelfIdResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdRequestSchema,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsRequestSchema,
  DeleteMySubShelvesByIdsResponse,
  GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfRequestSchema,
  MoveMySubShelfResponse,
  MoveMySubShelvesRequest,
  MoveMySubShelvesRequestSchema,
  MoveMySubShelvesResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdRequestSchema,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsRequestSchema,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdRequestSchema,
  UpdateMySubShelfByIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
import {
  CreateSubShelfByRootShelfId,
  DeleteMySubShelfById,
  DeleteMySubShelvesByIds,
  MoveMySubShelf,
  MoveMySubShelves,
  RestoreMySubShelfById,
  RestoreMySubShelvesByIds,
  UpdateMySubShelfById,
} from "@shared/api/invokers/subShelf.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

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
    mutationFn: async (
      request: CreateSubShelfByRootShelfIdRequest
    ): Promise<CreateSubShelfByRootShelfIdResponse> => {
      const validatedRequest =
        CreateSubShelfByRootShelfIdRequestSchema.parse(request);
      return await CreateSubShelfByRootShelfId(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "CREATE_SUB_SHELF_BY_ROOT_SHELF_ID_HOOK" as const,
  };
};

export const useUpdateMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMySubShelfByIdRequest
    ): Promise<UpdateMySubShelfByIdResponse> => {
      const validatedRequest = UpdateMySubShelfByIdRequestSchema.parse(request);
      return await UpdateMySubShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "UPDATE_MY_SUB_SHELF_BY_ID_HOOK" as const,
  };
};

export const useMoveMySubShelf = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMySubShelfRequest
    ): Promise<MoveMySubShelfResponse> => {
      const validatedRequest = MoveMySubShelfRequestSchema.parse(request);
      return await MoveMySubShelf(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "MOVE_MY_SUB_SHELF_HOOK" as const,
  };
};

export const useMoveMySubShelves = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMySubShelvesRequest
    ): Promise<MoveMySubShelvesResponse> => {
      const validatedRequest = MoveMySubShelvesRequestSchema.parse(request);
      return await MoveMySubShelves(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "MOVE_MY_SUB_SHELVES_HOOK" as const,
  };
};

export const useRestoreMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMySubShelfByIdRequest
    ): Promise<RestoreMySubShelfByIdResponse> => {
      const validatedRequest =
        RestoreMySubShelfByIdRequestSchema.parse(request);
      return await RestoreMySubShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "RESTORE_MY_SUB_SHELF_BY_ID_HOOK" as const,
  };
};

export const useRestoreMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMySubShelvesByIdsRequest
    ): Promise<RestoreMySubShelvesByIdsResponse> => {
      const validatedRequest =
        RestoreMySubShelvesByIdsRequestSchema.parse(request);
      return await RestoreMySubShelvesByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "RESTORE_MY_SUB_SHELVES_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMySubShelfByIdRequest
    ): Promise<DeleteMySubShelfByIdResponse> => {
      const validatedRequest = DeleteMySubShelfByIdRequestSchema.parse(request);
      return await DeleteMySubShelfById(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "DELETE_MY_SUB_SHELF_BY_ID_HOOK" as const,
  };
};

export const useDeleteMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMySubShelvesByIdsRequest
    ): Promise<DeleteMySubShelvesByIdsResponse> => {
      const validatedRequest =
        DeleteMySubShelvesByIdsRequestSchema.parse(request);
      return await DeleteMySubShelvesByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
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
    name: "DELETE_MY_SUB_SHELVES_BY_IDS_HOOK" as const,
  };
};
