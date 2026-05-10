import type { UUID } from "node:crypto";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  mutationFnBatchMoveMyBlockPacksByIds,
  mutationFnCreateBlockPack,
  mutationFnCreateBlockPacks,
  mutationFnDeleteMyBlockPackById,
  mutationFnDeleteMyBlockPacksByIds,
  mutationFnMoveMyBlockPackById,
  mutationFnMoveMyBlockPacksByIds,
  mutationFnRestoreMyBlockPackById,
  mutationFnRestoreMyBlockPacksByIds,
  mutationFnUpdateMyBlockPackById,
  mutationFnUpdateMyBlockPacksByIds,
  queryFnGetAllMyBlockPacksByRootShelfId,
  queryFnGetMyBlockPackAndItsParentById,
  queryFnGetMyBlockPackById,
  queryFnGetMyBlockPacksByParentSubShelfId,
} from "@shared/api/invokers/blockPack.invoker";
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

export const useGetMyBlockPackById = (
  hookRequest?: GetMyBlockPackByIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlockPackByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockPackByIdRequest
  ): Promise<GetMyBlockPackByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyBlockPackById(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded.publicId
    );
    return response;
  };

  const query = useQuery<GetMyBlockPackByIdResponse, Error>({
    queryKey: queryKeys.blockPack.oneById(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockPackByIdRequest
  ): Promise<GetMyBlockPackByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        callbackRequest.param.blockPackId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlockPackAndItsParentById = (
  hookRequest?: GetMyBlockPackAndItsParentByIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockPackAndItsParentByIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyBlockPackAndItsParentById(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded.publicId
    );
    return response;
  };

  const query = useQuery<GetMyBlockPackAndItsParentByIdResponse, Error>({
    queryKey: queryKeys.blockPack.oneById(
      hookRequest?.param.blockPackId as UUID | undefined,
      true
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockPackAndItsParentByIdRequest
  ): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.oneById(
        callbackRequest.param.blockPackId as UUID | undefined,
        true
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlockPacksByParentSubShelfId = (
  hookRequest?: GetMyBlockPacksByParentSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockPacksByParentSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyBlockPacksByParentSubShelfId(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded.publicId
    );
    return response;
  };

  const query = useQuery<GetMyBlockPacksByParentSubShelfIdResponse, Error>({
    queryKey: queryKeys.blockPack.manyByParentSubShelfId(
      hookRequest?.param.parentSubShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockPacksByParentSubShelfIdRequest
  ): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.manyByParentSubShelfId(
        callbackRequest.param.parentSubShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetAllMyBlockPacksByRootShelfId = (
  hookRequest?: GetAllMyBlockPacksByRootShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyBlockPacksByRootShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetAllMyBlockPacksByRootShelfId(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded.publicId
    );
    return response;
  };

  const query = useQuery<GetAllMyBlockPacksByRootShelfIdResponse, Error>({
    queryKey: queryKeys.blockPack.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyBlockPacksByRootShelfIdRequest
  ): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockPack.manyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateBlockPack = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateBlockPack,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useCreateBlockPacks = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateBlockPacks,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyBlockPackById,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyBlockPacksByIds,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackIds = variables.body.updatedBlockPacks
        .map(updatedBlockPack => updatedBlockPack.blockPackId)
        .filter(Boolean) as UUID[];
      const parentSubShelfIds = (
        variables.affected.parentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...parentSubShelfIds.map(parentSubShelfId =>
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId)
        ),
        ...rootShelfIds.map(rootShelfId =>
          queryKeys.blockPack.manyByRootShelfId(rootShelfId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useMoveMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMyBlockPackById,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfId = variables.affected
        .sourceParentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useMoveMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMyBlockPacksByIds,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackIds = (variables.body.blockPackIds || []).filter(
        Boolean
      ) as UUID[];
      const destinationParentSubShelfId = variables.body
        .destinationParentSubShelfId as UUID;
      const sourceParentSubShelfIds = (
        variables.affected.sourceParentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useBatchMoveMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBatchMoveMyBlockPacksByIds,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackIds = [] as UUID[];
      const destinationParentSubShelfIds = [] as UUID[];
      for (const movedBlockPack of variables.body.movedBlockPacks) {
        blockPackIds.push(...(movedBlockPack.blockPackIds as UUID[]));
        destinationParentSubShelfIds.push(
          movedBlockPack.destinationParentSubShelfId as UUID
        );
      }
      const sourceParentSubShelfIds = (
        variables.affected.sourceParentSubShelfIds || []
      ).filter(Boolean) as UUID[];
      const rootShelfIds = (variables.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const targetKeys: QueryKey[] = [
        ...sourceParentSubShelfIds.flatMap(sourceParentSubShelfId => [
          queryKeys.subShelf.oneById(sourceParentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(sourceParentSubShelfId),
        ]),
        ...destinationParentSubShelfIds.flatMap(destinationParentSubShelfId => [
          queryKeys.subShelf.oneById(destinationParentSubShelfId),
          ...blockPackIds.map(blockPackId =>
            queryKeys.blockPack.oneById(blockPackId)
          ),
          queryKeys.blockPack.manyByParentSubShelfId(
            destinationParentSubShelfId
          ),
        ]),
        ...rootShelfIds.flatMap(rootShelfId => [
          queryKeys.rootShelf.oneById(rootShelfId),
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlockPackById,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlockPacksByIds,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackIds = (variables.body.blockPackIds || []).filter(
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
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyBlockPackById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyBlockPackById,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackId = variables.body.blockPackId as UUID;
      const parentSubShelfId = variables.affected.parentSubShelfId as UUID;
      const rootShelfId = variables.affected.rootShelfId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.rootShelf.oneById(rootShelfId),
        queryKeys.subShelf.oneById(parentSubShelfId),
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyBlockPacksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyBlockPacksByIds,
    onSuccess: (response, variables) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded.publicId
      );
      const blockPackIds = (variables.body.blockPackIds || []).filter(
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
          queryKeys.blockPack.manyByRootShelfId(rootShelfId),
        ]),
        ...parentSubShelfIds.flatMap(parentSubShelfId => [
          queryKeys.subShelf.oneById(parentSubShelfId),
          queryKeys.blockPack.manyByParentSubShelfId(parentSubShelfId),
        ]),
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        ]),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
    },
    onError: error => {},
  });

  return mutation;
};
