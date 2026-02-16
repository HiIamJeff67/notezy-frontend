import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  queryFnGetAllMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsBlockGroupsAndTheirBlocksById,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@shared/api/functions/blockPack.function";
import {
  CreateBlockPackRequest,
  CreateBlockPackRequestSchema,
  CreateBlockPackResponse,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdRequestSchema,
  DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsRequestSchema,
  DeleteMyBlockPacksByIdsResponse,
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsBlockGroupsAndTheirBlocksByIdRequest,
  GetMyBlockPackAndItsBlockGroupsAndTheirBlocksByIdResponse,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdRequestSchema,
  MoveMyBlockPackByIdResponse,
  MoveMyBlockPacksByIdsRequest,
  MoveMyBlockPacksByIdsRequestSchema,
  MoveMyBlockPacksByIdsResponse,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdRequestSchema,
  RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsRequestSchema,
  RestoreMyBlockPacksByIdsResponse,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdRequestSchema,
  UpdateMyBlockPackByIdResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  CreateBlockPack,
  DeleteMyBlockPackById,
  DeleteMyBlockPacksByIds,
  MoveMyBlockPackById,
  MoveMyBlockPacksByIds,
  RestoreMyBlockPackById,
  RestoreMyBlockPacksByIds,
  UpdateMyBlockPackById,
} from "@shared/api/invokers/blockPack.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UUID } from "crypto";
import { ZodError } from "zod";

export const useGetMyBlockPackById = (
  hookRequest?: GetMyBlockPackByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.oneById(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => await queryFnGetMyBlockPackById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPackByIdRequest
  ): Promise<GetMyBlockPackByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () => await queryFnGetMyBlockPackById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockPackAndItsParentById = (
  hookRequest?: GetMyBlockPackAndItsParentByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.oneById(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPackAndItsParentById(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPackAndItsParentById(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_PACK_AND_ITS_PARENT_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockPackAndItsBlockGroupsAndTheirBlocksById = (
  hookRequest?: GetMyBlockPackAndItsBlockGroupsAndTheirBlocksByIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPackWithBlockGroupAndBlock.oneById(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPackAndItsBlockGroupsAndTheirBlocksById(
        hookRequest
      ),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPackAndItsBlockGroupsAndTheirBlocksByIdRequest
  ): Promise<GetMyBlockPackAndItsBlockGroupsAndTheirBlocksByIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPackWithBlockGroupAndBlock.oneById(
        callbackRequest.param.blockPackId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPackAndItsBlockGroupsAndTheirBlocksById(
          callbackRequest
        ),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_AND_ITS_BLOCK_GROUPS_AND_THEIR_BLOCS_BY_ID_HOOK" as const,
  };
};

export const useGetMyBlockPacksByParentSubShelfId = (
  hookRequest?: GetMyBlockPacksByParentSubShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.manyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetMyBlockPacksByParentSubShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.manyByParentSubShelfId(
        callbackRequest.param.parentSubShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetMyBlockPacksByParentSubShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_BLOCK_PACKS_BY_PARENT_SUB_SHELF_ID" as const,
  };
};

export const useGetAllMyBlockPacksByRootShelfId = (
  hookRequest?: GetAllMyBlockPacksByRootShelfIdRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.blockPack.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () =>
      await queryFnGetAllMyBlockPacksByRootShelfId(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
    return await queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.manyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID
      ),
      queryFn: async () =>
        await queryFnGetAllMyBlockPacksByRootShelfId(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime as number,
    });
  };

  return {
    ...query,
    queryAsync,
    name: "GET_ALL_MY_BLOCK_PACKS_BY_ROOT_SHELF_ID" as const,
  };
};

export const useCreateBlockPack = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: CreateBlockPackRequest
    ): Promise<CreateBlockPackResponse> => {
      const validatedRequest = CreateBlockPackRequestSchema.parse(request);
      return await CreateBlockPack(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
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
    name: "CREATE_BLOCK_PACK_HOOK" as const,
  };
};

export const useUpdateMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMyBlockPackByIdRequest
    ): Promise<UpdateMyBlockPackByIdResponse> => {
      const validatedRequest =
        UpdateMyBlockPackByIdRequestSchema.parse(request);
      return await UpdateMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.blockPackWithBlockGroupAndBlock.oneById(blockPackId),
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
    name: "UPDATE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useMoveMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMyBlockPackByIdRequest
    ): Promise<MoveMyBlockPackByIdResponse> => {
      const validatedRequest = MoveMyBlockPackByIdRequestSchema.parse(request);
      return await MoveMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId as UUID;
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfId = variables.affected
        .sourceParentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(sourceParentSubShelfId),
        queryKeys.subShelf.oneById(destinationParentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(sourceParentSubShelfId),
        queryKeys.blockPack.manyByParentSubShelfId(destinationParentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
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
    name: "MOVE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useMoveMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: MoveMyBlockPacksByIdsRequest
    ): Promise<MoveMyBlockPacksByIdsResponse> => {
      const validatedRequest =
        MoveMyBlockPacksByIdsRequestSchema.parse(request);
      return await MoveMyBlockPacksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfIds = (
        variables.affected.sourceParentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys = [
        queryKeys.rootShelf.oneById(rootShelfId),
        ...sourceParentSubShelfIds.flatMap(sourceParentSubShelfId => [
          queryKeys.subShelf.oneById(sourceParentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(sourceParentSubShelfId),
        ]),
        queryKeys.subShelf.oneById(destinationParentSubShelfId),
        ...blockPackIds.map(blockPackId =>
          queryKeys.blockPack.oneById(blockPackId)
        ),
        queryKeys.blockPack.manyByParentSubShelfId(destinationParentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
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
    name: "MOVE_MY_BLOCK_PACKS_BY_IDS_HOOK" as const,
  };
};

export const useRestoreMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockPackByIdRequest
    ): Promise<RestoreMyBlockPackByIdResponse> => {
      const validatedRequest =
        RestoreMyBlockPackByIdRequestSchema.parse(request);
      return await RestoreMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.blockPackWithBlockGroupAndBlock.oneById(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
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
    name: "RESTORE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useRestoreMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RestoreMyBlockPacksByIdsRequest
    ): Promise<RestoreMyBlockPacksByIdsResponse> => {
      const validatedRequest =
        RestoreMyBlockPacksByIdsRequestSchema.parse(request);
      return await RestoreMyBlockPacksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroupAndBlock.oneById(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        ]),
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
    name: "RESTORE_MY_BLOCK_PACKS_BY_IDS_HOOK" as const,
  };
};

export const useDeleteMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockPackByIdRequest
    ): Promise<DeleteMyBlockPackByIdResponse> => {
      const validatedRequest =
        DeleteMyBlockPackByIdRequestSchema.parse(request);
      return await DeleteMyBlockPackById(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.blockPackWithBlockGroupAndBlock.oneById(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
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
    name: "DELETE_MY_BLOCK_PACK_BY_ID_HOOK" as const,
  };
};

export const useDeleteMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: DeleteMyBlockPacksByIdsRequest
    ): Promise<DeleteMyBlockPacksByIdsResponse> => {
      const validatedRequest =
        DeleteMyBlockPacksByIdsRequestSchema.parse(request);
      return await DeleteMyBlockPacksByIds(validatedRequest);
    },
    onSuccess: (response, variables) => {
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys = [
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroupAndBlock.oneById(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        ]),
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
    name: "DELETE_MY_BLOCK_PACKS_BY_IDS_HOOK" as const,
  };
};
