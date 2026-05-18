import type { UUID } from "node:crypto";
import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse,
  BatchInsertBlockGroupsByBlockPackIdsRequest,
  BatchInsertBlockGroupsByBlockPackIdsResponse,
  BatchMoveMyBlockGroupsByIdsRequest,
  BatchMoveMyBlockGroupsByIdsResponse,
  DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupByIdResponse,
  DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsResponse,
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetAllMyBlockGroupsByBlockPackIdResponse,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdResponse,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupByIdResponse,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsResponse,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
  GetMyBlockGroupsByPrevBlockGroupIdResponse,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdResponse,
  InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdResponse,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertBlockGroupsByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdResponse,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  MoveMyBlockGroupByIdRequest,
  MoveMyBlockGroupByIdResponse,
  MoveMyBlockGroupsByIdsRequest,
  MoveMyBlockGroupsByIdsResponse,
  RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupByIdResponse,
  RestoreMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupsByIdsResponse,
} from "@shared/api/interfaces/blockGroup.interface";
import {
  mutationFnBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds,
  mutationFnBatchInsertBlockGroupsByBlockPackIds,
  mutationFnBatchMoveMyBlockGroupsByIds,
  mutationFnDeleteMyBlockGroupById,
  mutationFnDeleteMyBlockGroupsByIds,
  mutationFnInsertBlockGroupAndItsBlocksByBlockPackId,
  mutationFnInsertBlockGroupByBlockPackId,
  mutationFnInsertBlockGroupsAndTheirBlocksByBlockPackId,
  mutationFnInsertBlockGroupsByBlockPackId,
  mutationFnInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId,
  mutationFnMoveMyBlockGroupById,
  mutationFnMoveMyBlockGroupsByIds,
  mutationFnRestoreMyBlockGroupById,
  mutationFnRestoreMyBlockGroupsByIds,
  queryFnGetAllMyBlockGroupsByBlockPackId,
  queryFnGetMyBlockGroupAndItsBlocksById,
  queryFnGetMyBlockGroupById,
  queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId,
  queryFnGetMyBlockGroupsAndTheirBlocksByIds,
  queryFnGetMyBlockGroupsByPrevBlockGroupId,
} from "@shared/api/invokers/blockGroup.invoker";
import { BlockGroupLocalSimulator } from "@shared/api/local/simulators/blockGroup.simulator";
import { BlockGroupLocalSynchronizer } from "@shared/api/local/synchronizers/blockGroup.synchronizer";
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

export const useGetMyBlockGroupById = (
  hookRequest?: GetMyBlockGroupByIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlockGroupByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockGroupByIdRequest
  ): Promise<GetMyBlockGroupByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyBlockGroupById(request);
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
      await BlockGroupLocalSynchronizer.syncGetMyBlockGroupById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlockGroup =
          await BlockGroupLocalSimulator.simulateGetMyBlockGroupById(request);
        return {
          success: false,
          data: existingBlockGroup,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyBlockGroupByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockGroupByIdResponse, Error>({
    queryKey: queryKeys.blockGroup.oneById(
      hookRequest?.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockGroupByIdRequest
  ): Promise<GetMyBlockGroupByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.oneById(
        callbackRequest.param.blockGroupId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlockGroupAndItsBlocksById = (
  hookRequest?: GetMyBlockGroupAndItsBlocksByIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockGroupAndItsBlocksByIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockGroupAndItsBlocksByIdRequest
  ): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyBlockGroupAndItsBlocksById(request);
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
      await BlockGroupLocalSynchronizer.syncGetMyBlockGroupAndItsBlocksById(
        request,
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlockGroupAndItsBlocks =
          await BlockGroupLocalSimulator.simulateGetMyBlockGroupAndItsBlocksById(
            request
          );
        return {
          success: false,
          data: existingBlockGroupAndItsBlocks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyBlockGroupAndItsBlocksByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockGroupAndItsBlocksByIdResponse, Error>({
    queryKey: queryKeys.blockGroupWithBlock.oneById(
      hookRequest?.param.blockGroupId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockGroupAndItsBlocksByIdRequest
  ): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.oneById(
        callbackRequest.param.blockGroupId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlockGroupsAndTheirBlocksByIds = (
  hookRequest?: GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockGroupsAndTheirBlocksByIdsResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockGroupsAndTheirBlocksByIdsRequest
  ): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByIds(request);
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
      if (response.success && response.data) {
        response.data.forEach(blockGroupAndItsBlock => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.blockGroupWithBlock.oneById(
                blockGroupAndItsBlock.id as UUID
              ),
            },
            blockGroupAndItsBlock
          );
        });
      }
      await BlockGroupLocalSynchronizer.syncGetMyBlockGroupsAndTheirBlocksByIds(
        request,
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlockGroups =
          await BlockGroupLocalSimulator.simulateGetMyBlockGroupsAndTheirBlocksByIds(
            request
          );
        return {
          success: false,
          data: existingBlockGroups,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyBlockGroupsAndTheirBlocksByIdsResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockGroupsAndTheirBlocksByIdsResponse, Error>({
    queryKey: queryKeys.blockGroupWithBlock.manyByIds(
      hookRequest?.param.blockGroupIds as UUID[] | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockGroupsAndTheirBlocksByIdsRequest
  ): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.manyByIds(
        callbackRequest.param.blockGroupIds as UUID[] | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlockGroupsAndTheirBlocksByBlockPackId = (
  hookRequest?: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response =
        await queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId(request);
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
      queryClient.setQueriesData(
        {
          queryKey: queryKeys.blockGroup.manyByBlockPackId(
            request.param.blockPackId as UUID
          ),
        },
        response
      );
      response.data.forEach(blockGroup => {
        queryClient.setQueriesData(
          {
            queryKey: queryKeys.block.manyByBlockGroupId(blockGroup.id as UUID),
          },
          response
        );
      });
      queryClient.setQueriesData(
        {
          queryKey: queryKeys.block.manyByBlockPackId(
            request.param.blockPackId as UUID
          ),
        },
        response
      );
      await BlockGroupLocalSynchronizer.syncGetMyBlockGroupsAndTheirBlocksByBlockPackId(
        request,
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlockGroups =
          await BlockGroupLocalSimulator.simulateGetMyBlockGroupsAndTheirBlocksByBlockPackId(
            request
          );
        return {
          success: false,
          data: existingBlockGroups,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<
    GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse,
    Error
  >({
    queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
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
    callbackRequest: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockGroupWithBlock.manyByBlockPackId(
        callbackRequest.param.blockPackId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlockGroupsByPrevBlockGroupId = (
  hookRequest?: GetMyBlockGroupsByPrevBlockGroupIdRequest,
  options?: Partial<
    UseQueryOptions<GetMyBlockGroupsByPrevBlockGroupIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlockGroupsByPrevBlockGroupIdRequest
  ): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyBlockGroupsByPrevBlockGroupId(request);
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
      await BlockGroupLocalSynchronizer.syncGetMyBlockGroupsByPrevBlockGroupId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlockGroups =
          await BlockGroupLocalSimulator.simulateGetMyBlockGroupsByPrevBlockGroupId(
            request
          );
        return {
          success: false,
          data: existingBlockGroups,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetMyBlockGroupsByPrevBlockGroupIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlockGroupsByPrevBlockGroupIdResponse, Error>({
    queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
      hookRequest?.param.prevBlockGroupId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockGroupsByPrevBlockGroupIdRequest
  ): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.manyByPrevBlockGroupId(
        callbackRequest.param.prevBlockGroupId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetAllMyBlockGroupsByBlockPackId = (
  hookRequest?: GetAllMyBlockGroupsByBlockPackIdRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyBlockGroupsByBlockPackIdResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyBlockGroupsByBlockPackIdRequest
  ): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyBlockGroupsByBlockPackId(request);
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
      await BlockGroupLocalSynchronizer.syncGetAllMyBlockGroupsByBlockPackId(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlockGroups =
          await BlockGroupLocalSimulator.simulateGetAllMyBlockGroupsByBlockPackId(
            request
          );
        return {
          success: false,
          data: existingBlockGroups,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as unknown as GetAllMyBlockGroupsByBlockPackIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyBlockGroupsByBlockPackIdResponse, Error>({
    queryKey: queryKeys.blockGroup.manyByBlockPackId(
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
    callbackRequest: GetAllMyBlockGroupsByBlockPackIdRequest
  ): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.blockGroup.manyByBlockPackId(
        callbackRequest.param.blockPackId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useInsertBlockGroupByBlockPackId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: InsertBlockGroupByBlockPackIdRequest
  ): Promise<InsertBlockGroupByBlockPackIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnInsertBlockGroupByBlockPackId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupId = request.body.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncInsertBlockGroupByBlockPackId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateInsertBlockGroupByBlockPackId(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useInsertBlockGroupsByBlockPackId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: InsertBlockGroupsByBlockPackIdRequest
  ): Promise<InsertBlockGroupsByBlockPackIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnInsertBlockGroupsByBlockPackId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockPackContent of request.body.blockPackContents) {
        prevBlockGroupIds.push(
          blockPackContent.prevBlockGroupId as UUID | null
        );
      }
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncInsertBlockGroupsByBlockPackId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateInsertBlockGroupsByBlockPackId(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useBatchInsertBlockGroupsByBlockPackIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: BatchInsertBlockGroupsByBlockPackIdsRequest
  ): Promise<BatchInsertBlockGroupsByBlockPackIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnBatchInsertBlockGroupsByBlockPackIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds: UUID[] = [];
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockPackContent of request.body.blockPackContents) {
        blockPackIds.push(blockPackContent.blockPackId as UUID);
        prevBlockGroupIds.push(
          blockPackContent.prevBlockGroupId as UUID | null
        );
      }
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncBatchInsertBlockGroupsByBlockPackIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateBatchInsertBlockGroupsByBlockPackIds(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useInsertBlockGroupAndItsBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: InsertBlockGroupAndItsBlocksByBlockPackIdRequest
  ): Promise<InsertBlockGroupAndItsBlocksByBlockPackIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnInsertBlockGroupAndItsBlocksByBlockPackId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupId = request.body.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncInsertBlockGroupAndItsBlocksByBlockPackId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateInsertBlockGroupAndItsBlocksByBlockPackId(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useInsertBlockGroupsAndTheirBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      await BlockGroupLocalSimulator.simulateInsertBlockGroupsAndTheirBlocksByBlockPackId(
        request
      );
      const networkError = new NotezyFetchError(
        FetchClientExceptions.MissingNetwork()
      );
      return {
        success: false,
        data: {
          isAllSuccess: true,
          failedIndexes: [],
          successIndexes: request.body.blockGroupContents.map(
            (_content, index) => index
          ),
          successBlockGroupAndBlockIds: [],
          createdAt: new Date(),
        },
        exception: networkError.unWrap,
        embedded: { publicId: "" },
      };
    }

    return await mutationFnInsertBlockGroupsAndTheirBlocksByBlockPackId(
      request
    );
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackId = request.body.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(request.body.blockPackId as UUID),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        ...request.body.blockGroupContents.map(content =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(
            content.prevBlockGroupId as UUID | null
          )
        ),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncInsertBlockGroupsAndTheirBlocksByBlockPackId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateInsertBlockGroupsAndTheirBlocksByBlockPackId(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest
  ): Promise<BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds(
      request
    );
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackIds: UUID[] = [];
      const prevBlockGroupIds: (UUID | null)[] = [];
      for (const blockGroupContent of request.body.blockGroupContents) {
        blockPackIds.push(blockGroupContent.blockPackId as UUID);
        prevBlockGroupIds.push(
          blockGroupContent.prevBlockGroupId as UUID | null
        );
      }
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId(
      request
    );
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockPackId = request.body.blockPackId as UUID;
      const prevBlockGroupId = request.body.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMyBlockGroupByIdRequest
  ): Promise<MoveMyBlockGroupByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMyBlockGroupById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const movableBlockGroupId = request.body.movableBlockGroupId as UUID;
      const movablePrevBlockGroupId = request.body
        .movablePrevBlockGroupId as UUID | null;
      const blockPackId = request.body.blockPackId as UUID;
      const destinationBlockGroupId = request.body
        .destinationBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.oneById(movableBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(movableBlockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(movablePrevBlockGroupId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(destinationBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(
          destinationBlockGroupId ?? undefined
        ),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncMoveMyBlockGroupById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateMoveMyBlockGroupById(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useMoveMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: MoveMyBlockGroupsByIdsRequest
  ): Promise<MoveMyBlockGroupsByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnMoveMyBlockGroupsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const movableBlockGroupIds = request.body.movableBlockGroupIds as UUID[];
      const movablePrevBlockGroupIds = request.body
        .movablePrevBlockGroupIds as (UUID | null)[];
      const blockPackId = request.body.blockPackId as UUID;
      const destinationBlockGroupId = request.body
        .destinationBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        ...movableBlockGroupIds.flatMap(movableBlockGroupId => [
          queryKeys.blockGroup.oneById(movableBlockGroupId),
          queryKeys.blockGroupWithBlock.oneById(movableBlockGroupId),
        ]),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        ...movablePrevBlockGroupIds.map(movablePrevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(movablePrevBlockGroupId)
        ),
        queryKeys.blockGroup.manyByPrevBlockGroupId(destinationBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(
          destinationBlockGroupId ?? undefined
        ),
        queryKeys.blockGroupWithBlock.manyByIds(movableBlockGroupIds),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncMoveMyBlockGroupsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateMoveMyBlockGroupsByIds(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useBatchMoveMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: BatchMoveMyBlockGroupsByIdsRequest
  ): Promise<BatchMoveMyBlockGroupsByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnBatchMoveMyBlockGroupsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const movableBlockGroupIds = [] as UUID[];
      const movablePrevBlockGroupIds = [] as (UUID | null)[];
      const blockPackIds = [] as UUID[];
      const destinationBlockGroupIds = [] as (UUID | null)[];
      for (const movedBlockGroup of request.body.movedBlockGroups) {
        movableBlockGroupIds.push(movedBlockGroup.movableBlockGroupId as UUID);
        movablePrevBlockGroupIds.push(
          movedBlockGroup.movablePrevBlockGroupId as UUID
        );
        blockPackIds.push(movedBlockGroup.blockPackId as UUID);
        destinationBlockGroupIds.push(
          movedBlockGroup.destinationBlockGroupId as UUID
        );
      }
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...movableBlockGroupIds.flatMap(movableBlockGroupId => [
          queryKeys.blockGroup.oneById(movableBlockGroupId),
          queryKeys.blockGroupWithBlock.oneById(movableBlockGroupId),
        ]),
        ...movablePrevBlockGroupIds.map(movablePrevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(movablePrevBlockGroupId)
        ),
        ...destinationBlockGroupIds.flatMap(destinationBlockGroupId => [
          queryKeys.blockGroup.manyByPrevBlockGroupId(destinationBlockGroupId),
          queryKeys.blockGroupWithBlock.oneById(
            destinationBlockGroupId ?? undefined
          ),
        ]),
        queryKeys.blockGroupWithBlock.manyByIds(movableBlockGroupIds),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncBatchMoveMyBlockGroupsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateBatchMoveMyBlockGroupsByIds(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMyBlockGroupByIdRequest
  ): Promise<RestoreMyBlockGroupByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMyBlockGroupById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockGroupId = request.body.blockGroupId as UUID;
      const blockPackId = response.data.blockPackId as UUID;
      const prevBlockGroupId = response.data.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncRestoreMyBlockGroupById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateRestoreMyBlockGroupById(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: RestoreMyBlockGroupsByIdsRequest
  ): Promise<RestoreMyBlockGroupsByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnRestoreMyBlockGroupsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockGroupIds = request.body.blockGroupIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...response.data.flatMap(field => [
          queryKeys.blockPack.oneById(field.blockPackId as UUID),
          queryKeys.blockPackWithBlockGroup.oneById(field.blockPackId as UUID),
          queryKeys.blockGroup.manyByBlockPackId(field.blockPackId as UUID),
          queryKeys.blockGroup.manyByPrevBlockGroupId(
            field.prevBlockGroupId as UUID | null
          ),
        ]),
        ...blockGroupIds.map(blockGroupId =>
          queryKeys.blockGroup.oneById(blockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncRestoreMyBlockGroupsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateRestoreMyBlockGroupsByIds(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyBlockGroupById = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMyBlockGroupByIdRequest
  ): Promise<DeleteMyBlockGroupByIdResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMyBlockGroupById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockGroupId = request.body.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
      const prevBlockGroupId = request.affected.prevBlockGroupId as UUID | null;
      const targetKeys: QueryKey[] = [
        queryKeys.blockPack.oneById(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncDeleteMyBlockGroupById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateDeleteMyBlockGroupById(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyBlockGroupsByIds = () => {
  const queryClient = getQueryClient();

  const perform = async (
    request: DeleteMyBlockGroupsByIdsRequest
  ): Promise<DeleteMyBlockGroupsByIdsResponse> => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    return await mutationFnDeleteMyBlockGroupsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request) => {
      if (response.success === false) return;
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
      const blockGroupIds = request.body.blockGroupIds as UUID[];
      const blockPackIds = request.affected.blockPackIds as UUID[];
      const prevBlockGroupIds = request.affected
        .prevBlockGroupIds as (UUID | null)[];
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.blockPack.oneById(blockPackId),
          queryKeys.blockGroup.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        ...blockGroupIds.flatMap(blockGroupId => [
          queryKeys.blockGroup.oneById(blockGroupId),
          queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        ]),
        queryKeys.blockGroupWithBlock.manyByIds(blockGroupIds),
        ...prevBlockGroupIds.map(prevBlockGroupId =>
          queryKeys.blockGroup.manyByPrevBlockGroupId(prevBlockGroupId)
        ),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockGroupLocalSynchronizer.syncDeleteMyBlockGroupsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockGroupLocalSimulator.simulateDeleteMyBlockGroupsByIds(
              request
            );
            break;
        }
      }
    },
  });

  return mutation;
};
