import type { UUID } from "node:crypto";
import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
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
import { BlockLocalSimulator } from "@shared/api/local/simulators/block.simulator";
import { BlockLocalSynchronizer } from "@shared/api/local/synchronizers/block.synchronizer";
import { getQueryClient } from "@shared/api/queryClient";
import { UseQueryDefaultOptions } from "@shared/api/queryHookOptions";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

const syncBlockLocalMirror = async (
  operationName: string,
  operation: () => Promise<void>
) => {
  try {
    await operation();
  } catch (error) {
    console.error(`[BlockLocalSynchronizer] ${operationName} failed`, error);
  }
};

export const useGetMyBlockById = (
  hookRequest?: GetMyBlockByIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlockByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetMyBlockByIdRequest
  ): Promise<GetMyBlockByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyBlockById(request);
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
      await BlockLocalSynchronizer.syncGetMyBlockById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlock =
          await BlockLocalSimulator.simulateGetMyBlockById(request);
        return {
          success: false,
          data: existingBlock,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyBlockByIdResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyBlockByIdResponse, Error>({
    queryKey: queryKeys.block.oneById(
      hookRequest?.param.blockId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
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
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};

export const useGetMyBlocksByIds = (
  hookRequest?: GetMyBlocksByIdsRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByIdsResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetMyBlocksByIdsRequest
  ): Promise<GetMyBlocksByIdsResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyBlocksByIds(request);
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
      await BlockLocalSynchronizer.syncGetMyBlocksByIds(response);
      if (response.success && response.data) {
        response.data.forEach(block => {
          queryClient.setQueriesData(
            { queryKey: queryKeys.block.oneById(block.id as UUID) },
            duplicateResponse(response, true, block)
          );
        });
      }
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlocks =
          await BlockLocalSimulator.simulateGetMyBlocksByIds(request);
        return {
          success: false,
          data: existingBlocks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyBlocksByIdsResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyBlocksByIdsResponse, Error>({
    queryKey: queryKeys.block.manyByIds(
      hookRequest?.param.blockIds as UUID[] | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
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
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};

export const useGetMyBlocksByBlockPackId = (
  hookRequest?: GetMyBlocksByBlockPackIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByBlockPackIdResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetMyBlocksByBlockPackIdRequest
  ): Promise<GetMyBlocksByBlockPackIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetMyBlocksByBlockPackId(request);
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
      await BlockLocalSynchronizer.syncGetMyBlocksByBlockPackId(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlocks =
          await BlockLocalSimulator.simulateGetMyBlocksByBlockPackId(request);
        return {
          success: false,
          data: existingBlocks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyBlocksByBlockPackIdResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetMyBlocksByBlockPackIdResponse, Error>({
    queryKey: queryKeys.block.manyByBlockPackId(
      hookRequest?.param.blockPackId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
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
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};

export const useGetAllMyBlocks = (
  hookRequest?: GetAllMyBlocksRequest,
  options?: Partial<UseQueryOptions<GetAllMyBlocksResponse, Error>>
) => {
  const queryClient = getQueryClient();
  const perform = async (
    request?: GetAllMyBlocksRequest
  ): Promise<GetAllMyBlocksResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }
      const response = await queryFnGetAllMyBlocks(request);
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
      await BlockLocalSynchronizer.syncGetAllMyBlocks(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlocks =
          await BlockLocalSimulator.simulateGetAllMyBlocks(request);
        return {
          success: false,
          data: existingBlocks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyBlocksResponse;
      }
      throw error;
    }
  };

  const query = useQuery<GetAllMyBlocksResponse, Error>({
    queryKey: queryKeys.block.myAll(),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    networkMode: "always",
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (callbackRequest: GetAllMyBlocksRequest) =>
    queryClient.fetchQuery({
      queryKey: queryKeys.block.myAll(),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      networkMode: "always",
      ...options,
    });

  return { ...query, fetch };
};

export const useInsertBlock = () =>
  useMutation({
    mutationFn: async (
      request: InsertBlockRequest
    ): Promise<InsertBlockResponse> => {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
        }
        return await mutationFnInsertBlock(request);
      } catch (error) {
        if (error instanceof NotezyFetchError) {
          await BlockLocalSimulator.simulateInsertBlock(request);
          return {
            success: false,
            data: {
              blockPackId: request.body.blockPackId,
              createdAt: new Date(),
            },
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as InsertBlockResponse;
        }
        throw error;
      }
    },
    networkMode: "always",
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds = response.data.blockPackId
        ? ([response.data.blockPackId] as UUID[])
        : [];
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
                blockCount: Math.max(
                  0,
                  oldData.data.blockCount +
                    (response.data.blockIds?.length ?? 1)
                ),
              },
            };
          }
        );
      }
      await syncBlockLocalMirror("insertBlock", () =>
        BlockLocalSynchronizer.syncInsertBlock(request, response)
      );
      void Promise.all(
        [
          ...blockPackIds.map(blockPackId =>
            queryKeys.block.manyByBlockPackId(blockPackId)
          ),
          queryKeys.block.myAll(),
        ].map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });

export const useInsertBlocks = () =>
  useMutation({
    mutationFn: async (
      request: InsertBlocksRequest
    ): Promise<InsertBlocksResponse> => {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
        }
        return await mutationFnInsertBlocks(request);
      } catch (error) {
        if (error instanceof NotezyFetchError) {
          await BlockLocalSimulator.simulateInsertBlocks(request);
          return {
            success: false,
            data: {
              isAllSuccess: false,
              failedIndexes: [],
              successIndexes: request.body.insertedBlocks.map(
                (_insertedBlock, index) => index
              ),
              successBlockPackAndBlockIds: request.body.insertedBlocks.map(
                insertedBlock => ({
                  blockPackId: insertedBlock.blockPackId,
                  blockIds: [],
                })
              ),
              createdAt: new Date(),
            },
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as InsertBlocksResponse;
        }
        throw error;
      }
    },
    networkMode: "always",
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds = (request.affected?.blockPackIds ?? []) as UUID[];
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
                blockCount: Math.max(
                  0,
                  oldData.data.blockCount + response.data.successIndexes.length
                ),
              },
            };
          }
        );
      }
      await syncBlockLocalMirror("insertBlocks", () =>
        BlockLocalSynchronizer.syncInsertBlocks(request, response)
      );
      void Promise.all(
        [
          ...blockPackIds.map(blockPackId =>
            queryKeys.block.manyByBlockPackId(blockPackId)
          ),
          queryKeys.block.myAll(),
        ].map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });

export const useUpdateMyBlockById = () =>
  useMutation({
    mutationFn: async (
      request: UpdateMyBlockByIdRequest
    ): Promise<UpdateMyBlockByIdResponse> => {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
        }
        return await mutationFnUpdateMyBlockById(request);
      } catch (error) {
        if (error instanceof NotezyFetchError) {
          await BlockLocalSimulator.simulateUpdateMyBlockById(request);
          return {
            success: false,
            data: { updatedAt: new Date() },
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as UpdateMyBlockByIdResponse;
        }
        throw error;
      }
    },
    networkMode: "always",
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds = (request.affected?.blockPackIds ?? []) as UUID[];
      const queryClient = getQueryClient();
      await syncBlockLocalMirror("updateMyBlockById", () =>
        BlockLocalSynchronizer.syncUpdateMyBlockById(request, response)
      );
      void Promise.all(
        [
          queryKeys.block.oneById(request.body.blockId as UUID),
          ...blockPackIds.map(blockPackId =>
            queryKeys.block.manyByBlockPackId(blockPackId)
          ),
          queryKeys.block.myAll(),
        ].map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });

export const useUpdateMyBlocksByIds = () =>
  useMutation({
    mutationFn: async (
      request: UpdateMyBlocksByIdsRequest
    ): Promise<UpdateMyBlocksByIdsResponse> => {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
        }
        return await mutationFnUpdateMyBlocksByIds(request);
      } catch (error) {
        if (error instanceof NotezyFetchError) {
          await BlockLocalSimulator.simulateUpdateMyBlocksByIds(request);
          return {
            success: false,
            data: {
              isAllSuccess: false,
              failedIndexes: [],
              successIndexes: request.body.updatedBlocks.map(
                (_updatedBlock, index) => index
              ),
              successBlockPackAndBlockIds: [],
              updatedAt: new Date(),
            },
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as UpdateMyBlocksByIdsResponse;
        }
        throw error;
      }
    },
    networkMode: "always",
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds = (request.affected?.blockPackIds ?? []) as UUID[];
      const queryClient = getQueryClient();
      await syncBlockLocalMirror("updateMyBlocksByIds", () =>
        BlockLocalSynchronizer.syncUpdateMyBlocksByIds(request, response)
      );
      void Promise.all(
        [
          ...request.body.updatedBlocks.map(block =>
            queryKeys.block.oneById(block.blockId as UUID)
          ),
          ...blockPackIds.map(blockPackId =>
            queryKeys.block.manyByBlockPackId(blockPackId)
          ),
          queryKeys.block.myAll(),
        ].map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });

export const useDeleteMyBlockById = () =>
  useMutation({
    mutationFn: async (
      request: DeleteMyBlockByIdRequest
    ): Promise<DeleteMyBlockByIdResponse> => {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
        }
        return await mutationFnDeleteMyBlockById(request);
      } catch (error) {
        if (error instanceof NotezyFetchError) {
          await BlockLocalSimulator.simulateDeleteMyBlockById(request);
          return {
            success: false,
            data: { deletedAt: new Date() },
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as DeleteMyBlockByIdResponse;
        }
        throw error;
      }
    },
    networkMode: "always",
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds = (request.affected?.blockPackIds ?? []) as UUID[];
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
                blockCount: Math.max(0, oldData.data.blockCount - 1),
              },
            };
          }
        );
      }
      await syncBlockLocalMirror("deleteMyBlockById", () =>
        BlockLocalSynchronizer.syncDeleteMyBlockById(request, response)
      );
      void Promise.all(
        [
          queryKeys.block.oneById(request.body.blockId as UUID),
          ...blockPackIds.map(blockPackId =>
            queryKeys.block.manyByBlockPackId(blockPackId)
          ),
          queryKeys.block.myAll(),
        ].map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });

export const useDeleteMyBlocksByIds = () =>
  useMutation({
    mutationFn: async (
      request: DeleteMyBlocksByIdsRequest
    ): Promise<DeleteMyBlocksByIdsResponse> => {
      try {
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
          throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
        }
        return await mutationFnDeleteMyBlocksByIds(request);
      } catch (error) {
        if (error instanceof NotezyFetchError) {
          await BlockLocalSimulator.simulateDeleteMyBlocksByIds(request);
          return {
            success: false,
            data: { deletedAt: new Date() },
            exception: error.unWrap,
            embedded: { publicId: "" },
          } as DeleteMyBlocksByIdsResponse;
        }
        throw error;
      }
    },
    networkMode: "always",
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds = (request.affected?.blockPackIds ?? []) as UUID[];
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
                blockCount: Math.max(
                  0,
                  oldData.data.blockCount - request.body.blockIds.length
                ),
              },
            };
          }
        );
      }
      await syncBlockLocalMirror("deleteMyBlocksByIds", () =>
        BlockLocalSynchronizer.syncDeleteMyBlocksByIds(request, response)
      );
      void Promise.all(
        [
          ...request.body.blockIds.map(blockId =>
            queryKeys.block.oneById(blockId as UUID)
          ),
          ...blockPackIds.map(blockPackId =>
            queryKeys.block.manyByBlockPackId(blockPackId)
          ),
          queryKeys.block.myAll(),
        ].map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
  });
