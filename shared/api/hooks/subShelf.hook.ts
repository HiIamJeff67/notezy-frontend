import type { UUID } from "node:crypto";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
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
} from "@shared/api/invokers/subShelf.invoker";
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

export const useGetMySubShelfById = (
  hookRequest?: GetMySubShelfByIdRequest,
  options?: Partial<UseQueryOptions<GetMySubShelfByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelfByIdRequest
  ): Promise<GetMySubShelfByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMySubShelfById(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded?.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded?.publicId
    );
    return response;
  };

  const query = useQuery<GetMySubShelfByIdResponse, Error>({
    queryKey: queryKeys.subShelf.oneById(
      hookRequest?.param.subShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelfByIdRequest
  ): Promise<GetMySubShelfByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.oneById(
        callbackRequest.param.subShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMySubShelvesByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesByPrevSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMySubShelvesByPrevSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMySubShelvesByPrevSubShelfId(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded?.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded?.publicId
    );
    return response;
  };

  const query = useQuery<GetMySubShelvesByPrevSubShelfIdResponse, Error>({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelvesByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetAllMySubShelvesByRootShelfId = (
  hookRequest?: GetAllMySubShelvesByRootShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMySubShelvesByRootShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMySubShelvesByRootShelfIdRequest
  ): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetAllMySubShelvesByRootShelfId(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded?.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded?.publicId
    );
    return response;
  };

  const query = useQuery<GetAllMySubShelvesByRootShelfIdResponse, Error>({
    queryKey: queryKeys.subShelf.manyByRootShelfId(
      hookRequest?.param.rootShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: options?.staleTime ?? UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMySubShelvesByRootShelfIdRequest
  ): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByRootShelfId(
        callbackRequest.param.rootShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMySubShelvesAndItemsByPrevSubShelfId = (
  hookRequest?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  options?: Partial<
    UseQueryOptions<GetMySubShelvesAndItemsByPrevSubShelfIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response =
      await queryFnGetMySubShelvesAndItemsByPrevSubShelfId(request);
    LocalStorageManipulator.ensureItem(
      LocalStorageKey.accessToken,
      response.refreshableTokens?.newAccessToken,
      response.embedded?.publicId
    );
    SessionStorageManipulator.ensureItem(
      SessionStorageKey.csrfToken,
      response.refreshableTokens?.newCSRFToken,
      response.embedded?.publicId
    );
    return response;
  };

  const query = useQuery<
    GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
    Error
  >({
    queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
      hookRequest?.param.prevSubShelfId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
  ): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.subShelf.manyByPrevSubShelfId(
        callbackRequest.param.prevSubShelfId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateSubShelfByRootShelfId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateSubShelfByRootShelfId,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    onError: error => {},
  });

  return mutation;
};

export const useCreateSubShelvesByRootShelfIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateSubShelvesByRootShelfIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const prevSubShelfIds = request.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = request.affected.rootShelfIds as UUID[];
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
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMySubShelfById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    onError: error => {},
  });

  return mutation;
};
export const useUpdateMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMySubShelvesByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const prevSubShelfIds = request.affected
        .prevSubShelfIds as (UUID | null)[];
      const rootShelfIds = request.affected.rootShelfIds as UUID[];
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
    onError: error => {},
  });

  return mutation;
};

export const useMoveMySubShelf = () => {
  const queryClient = getQueryClient();
  const mutation = useMutation({
    mutationFn: mutationFnMoveMySubShelf,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const sourceSubShelfId = request.body.sourceSubShelfId as UUID;
      const destinationSubShelfId = request.body
        .destinationSubShelfId as UUID | null;
      const rootShelfId = request.affected.rootShelfId as UUID;
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
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
    onError: error => {},
  });

  return mutation;
};

export const useMoveMySubShelves = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnMoveMySubShelves,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const sourceSubShelfIds = (request.body.sourceSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const destinationSubShelfId = request.body.destinationSubShelfId as UUID;
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
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
    onError: error => {},
  });

  return mutation;
};

export const useBatchMoveMySubShelves = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBatchMoveMySubShelves,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const sourceSubShelfIds = [] as UUID[];
      const destinationSubShelfIds = [] as UUID[];
      for (const movedSubShelf of request.body.movedSubShelves) {
        sourceSubShelfIds.push(...(movedSubShelf.sourceSubShelfIds as UUID[]));
        destinationSubShelfIds.push(
          movedSubShelf.destinationSubShelfId as UUID
        );
      }
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const childSubShelfIds = (request.affected.childSubShelfIds || []).filter(
        Boolean
      ) as UUID[];
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
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMySubShelfById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const subShelfId = request.body.subShelfId as UUID;
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    onError: error => {},
  });

  return mutation;
};
export const useRestoreMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMySubShelvesByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const subShelfIds = (request.body.subShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const prevSubShelfIds = (request.affected.prevSubShelfIds || []).filter(
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
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMySubShelfById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMySubShelfById,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const subShelfId = request.body.subShelfId as UUID;
      const prevSubShelfId = request.affected.prevSubShelfId as UUID;
      const rootShelfId = request.affected.rootShelfId as UUID;
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
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMySubShelvesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMySubShelvesByIds,
    onSuccess: (response, request) => {
      LocalStorageManipulator.ensureItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken,
        response.embedded?.publicId
      );
      SessionStorageManipulator.ensureItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken,
        response.embedded?.publicId
      );
      const subShelfIds = (request.body.subShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const rootShelfIds = (request.affected.rootShelfIds || []).filter(
        Boolean
      ) as UUID[];
      const prevSubShelfIds = (request.affected.prevSubShelfIds || []).filter(
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
    onError: error => {},
  });

  return mutation;
};
