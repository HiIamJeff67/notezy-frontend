import type { UUID } from "node:crypto";
import { NotezyFetchError } from "@shared/api/exceptions/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/exceptions/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  GetAllMyBlocksRequest,
  GetAllMyBlocksResponse,
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
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
  useQuery,
} from "@tanstack/react-query";

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
