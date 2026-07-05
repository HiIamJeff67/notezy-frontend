import type { UUID } from "node:crypto";
import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  DeleteMyBlockByIdRequest,
  DeleteMyBlockByIdResponse,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsResponse,
  GetAllMyBlocksRequest,
  GetAllMyBlocksResponse,
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
  InsertBlockRequest,
  InsertBlockResponse,
  InsertBlocksRequest,
  InsertBlocksResponse,
  UpdateMyBlockByIdRequest,
  UpdateMyBlockByIdResponse,
  UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import type { GetMyBlockPackByIdResponse } from "@shared/api/interfaces/blockPack.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
  mutationFnDeleteMyBlockById,
  mutationFnDeleteMyBlocksByIds,
  mutationFnInsertBlock,
  mutationFnInsertBlocks,
  mutationFnUpdateMyBlockById,
  mutationFnUpdateMyBlocksByIds,
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockPackId,
  queryFnGetMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
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

const requireRequest = <T,>(request?: T): T => {
  if (!request) {
    throw new NotezyValidationError(
      ValidationClientException.ReceivedUndefinedRequest()
    );
  }
  return request;
};

const requireOnline = () => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
  }
};

const keepTokens = (response: { refreshableTokens?: any; embedded?: any }) => {
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
};

const invalidateAll = (keys: QueryKey[]) => {
  const queryClient = getQueryClient();
  void Promise.all(keys.map(queryKey => queryClient.invalidateQueries({ queryKey })));
};

const blockPackIdsFrom = (request: { affected?: { blockPackIds?: string[] } }) =>
  (request.affected?.blockPackIds ?? []) as UUID[];

const updateBlockCount = (blockPackIds: UUID[], delta: number) => {
  const queryClient = getQueryClient();
  for (const blockPackId of blockPackIds) {
    queryClient.setQueryData(
      queryKeys.blockPack.oneById(blockPackId),
      (oldData: GetMyBlockPackByIdResponse | undefined) => {
        if (!oldData?.success) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            blockCount: Math.max(0, oldData.data.blockCount + delta),
          },
        };
      }
    );
  }
};

export const useGetMyBlockById = (
  hookRequest?: GetMyBlockByIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlockByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (request?: GetMyBlockByIdRequest) => {
    requireOnline();
    const response = await queryFnGetMyBlockById(requireRequest(request));
    keepTokens(response);
    return response;
  };

  const query = useQuery<GetMyBlockByIdResponse, Error>({
    queryKey: queryKeys.block.oneById(
      hookRequest?.param.blockId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetMyBlockByIdRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.oneById(
        callbackRequest.param.blockId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });

  return { ...query, fetch };
};

export const useGetMyBlocksByIds = (
  hookRequest?: GetMyBlocksByIdsRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByIdsResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (request?: GetMyBlocksByIdsRequest) => {
    requireOnline();
    const response = await queryFnGetMyBlocksByIds(requireRequest(request));
    keepTokens(response);
    if (response.success && response.data) {
      response.data.forEach(block => {
        queryClient.setQueriesData(
          { queryKey: queryKeys.block.oneById(block.id as UUID) },
          duplicateResponse(response, true, block)
        );
      });
    }
    return response;
  };

  const query = useQuery<GetMyBlocksByIdsResponse, Error>({
    queryKey: queryKeys.block.manyByIds(
      hookRequest?.param.blockIds as UUID[] | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetMyBlocksByIdsRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByIds(
        callbackRequest.param.blockIds as UUID[] | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });

  return { ...query, fetch };
};

export const useGetMyBlocksByBlockPackId = (
  hookRequest?: GetMyBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByBlockPackIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (request?: GetMyBlocksByBlockPackIdRequest) => {
    requireOnline();
    const response = await queryFnGetMyBlocksByBlockPackId(
      requireRequest(request)
    );
    keepTokens(response);
    return response;
  };

  const query = useQuery<GetMyBlocksByBlockPackIdResponse, Error>({
    queryKey: queryKeys.block.manyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetMyBlocksByBlockPackIdRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockPackId(
        callbackRequest.param.blockPackId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });

  return { ...query, fetch };
};

export const useGetAllMyBlocks = (
  hookRequest?: GetAllMyBlocksRequest,
  options?: Partial<UseQueryOptions<GetAllMyBlocksResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (request?: GetAllMyBlocksRequest) => {
    requireOnline();
    const response = await queryFnGetAllMyBlocks(requireRequest(request));
    keepTokens(response);
    return response;
  };

  const query = useQuery<GetAllMyBlocksResponse, Error>({
    queryKey: queryKeys.block.myAll(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetAllMyBlocksRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.myAll(),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });

  return { ...query, fetch };
};

export const useInsertBlock = () =>
  useMutation({
    mutationFn: async (request: InsertBlockRequest): Promise<InsertBlockResponse> => {
      requireOnline();
      return mutationFnInsertBlock(request);
    },
    onSuccess: response => {
      if (response.success === false) return;
      keepTokens(response);
      const blockPackIds = response.data.blockPackId
        ? ([response.data.blockPackId] as UUID[])
        : [];
      updateBlockCount(blockPackIds, response.data.blockIds?.length ?? 1);
      invalidateAll([
        ...blockPackIds.map(blockPackId =>
          queryKeys.block.manyByBlockPackId(blockPackId)
        ),
        queryKeys.block.myAll(),
      ]);
    },
  });

export const useInsertBlocks = () =>
  useMutation({
    mutationFn: async (
      request: InsertBlocksRequest
    ): Promise<InsertBlocksResponse> => {
      requireOnline();
      return mutationFnInsertBlocks(request);
    },
    onSuccess: (response, request) => {
      if (response.success === false) return;
      keepTokens(response);
      const blockPackIds = blockPackIdsFrom(request);
      updateBlockCount(blockPackIds, response.data.successIndexes.length);
      invalidateAll([
        ...blockPackIds.map(blockPackId =>
          queryKeys.block.manyByBlockPackId(blockPackId)
        ),
        queryKeys.block.myAll(),
      ]);
    },
  });

export const useUpdateMyBlockById = () =>
  useMutation({
    mutationFn: async (
      request: UpdateMyBlockByIdRequest
    ): Promise<UpdateMyBlockByIdResponse> => {
      requireOnline();
      return mutationFnUpdateMyBlockById(request);
    },
    onSuccess: (response, request) => {
      if (response.success === false) return;
      keepTokens(response);
      const blockPackIds = blockPackIdsFrom(request);
      invalidateAll([
        queryKeys.block.oneById(request.body.blockId as UUID),
        ...blockPackIds.map(blockPackId =>
          queryKeys.block.manyByBlockPackId(blockPackId)
        ),
        queryKeys.block.myAll(),
      ]);
    },
  });

export const useUpdateMyBlocksByIds = () =>
  useMutation({
    mutationFn: async (
      request: UpdateMyBlocksByIdsRequest
    ): Promise<UpdateMyBlocksByIdsResponse> => {
      requireOnline();
      return mutationFnUpdateMyBlocksByIds(request);
    },
    onSuccess: (response, request) => {
      if (response.success === false) return;
      keepTokens(response);
      const blockPackIds = blockPackIdsFrom(request);
      invalidateAll([
        ...request.body.updatedBlocks.map(block =>
          queryKeys.block.oneById(block.blockId as UUID)
        ),
        ...blockPackIds.map(blockPackId =>
          queryKeys.block.manyByBlockPackId(blockPackId)
        ),
        queryKeys.block.myAll(),
      ]);
    },
  });

export const useDeleteMyBlockById = () =>
  useMutation({
    mutationFn: async (
      request: DeleteMyBlockByIdRequest
    ): Promise<DeleteMyBlockByIdResponse> => {
      requireOnline();
      return mutationFnDeleteMyBlockById(request);
    },
    onSuccess: (response, request) => {
      if (response.success === false) return;
      keepTokens(response);
      const blockPackIds = blockPackIdsFrom(request);
      updateBlockCount(blockPackIds, -1);
      invalidateAll([
        queryKeys.block.oneById(request.body.blockId as UUID),
        ...blockPackIds.map(blockPackId =>
          queryKeys.block.manyByBlockPackId(blockPackId)
        ),
        queryKeys.block.myAll(),
      ]);
    },
  });

export const useDeleteMyBlocksByIds = () =>
  useMutation({
    mutationFn: async (
      request: DeleteMyBlocksByIdsRequest
    ): Promise<DeleteMyBlocksByIdsResponse> => {
      requireOnline();
      return mutationFnDeleteMyBlocksByIds(request);
    },
    onSuccess: (response, request) => {
      if (response.success === false) return;
      keepTokens(response);
      const blockPackIds = blockPackIdsFrom(request);
      updateBlockCount(blockPackIds, -request.body.blockIds.length);
      invalidateAll([
        ...request.body.blockIds.map(blockId =>
          queryKeys.block.oneById(blockId as UUID)
        ),
        ...blockPackIds.map(blockPackId =>
          queryKeys.block.manyByBlockPackId(blockPackId)
        ),
        queryKeys.block.myAll(),
      ]);
    },
  });
