import type { UUID } from "node:crypto";
import { PartialBlock } from "@blocknote/core/blocks";
import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  GetAllMyBlocksRequest,
  GetAllMyBlocksResponse,
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdResponse,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockGroupIdsResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import type { GetMyBlockPackByIdResponse } from "@shared/api/interfaces/blockPack.interface";
import { duplicateResponse } from "@shared/api/interfaces/context.interface";
import {
  mutationFnDeleteMyBlockById,
  mutationFnDeleteMyBlocksByIds,
  mutationFnInsertBlock,
  mutationFnInsertBlocks,
  mutationFnRestoreMyBlockById,
  mutationFnRestoreMyBlocksByIds,
  mutationFnUpdateMyBlockById,
  mutationFnUpdateMyBlocksByIds,
  queryFnGetAllMyBlocks,
  queryFnGetMyBlockById,
  queryFnGetMyBlocksByBlockGroupId,
  queryFnGetMyBlocksByBlockGroupIds,
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
  type QueryKey,
  type UseQueryOptions,
  useMutation,
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
      const response = await queryFnGetMyBlockById(request);
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
      await BlockLocalSynchronizer.syncGetMyBlockById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlock =
          await BlockLocalSimulator.simulateGetMyBlockById(request);
        if (!existingBlock) {
          throw error;
        }
        return {
          success: false,
          data: {
            ...existingBlock,
            props: structuredClone(existingBlock.props),
            content: structuredClone(existingBlock.content),
          },
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
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlockByIdRequest
  ): Promise<GetMyBlockByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.block.oneById(
        callbackRequest.param.blockId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
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
      const response = await queryFnGetMyBlocksByIds(request);
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
        response.data.forEach((block: any) => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.oneById(block.id as UUID),
            },
            duplicateResponse(response, true, block)
          );
        });
      }
      await BlockLocalSynchronizer.syncGetMyBlocksByIds(response);
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
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlocksByIdsRequest
  ): Promise<GetMyBlocksByIdsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByIds(
        callbackRequest.param.blockIds as UUID[] | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlocksByBlockGroupId = (
  hookRequest?: GetMyBlocksByBlockGroupIdRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByBlockGroupIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlocksByBlockGroupIdRequest
  ): Promise<GetMyBlocksByBlockGroupIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      const response = await queryFnGetMyBlocksByBlockGroupId(request);
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
      await BlockLocalSynchronizer.syncGetMyBlocksByBlockGroupId(
        request,
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const { rawArborizedEditableBlock } =
          await BlockLocalSimulator.simulateGetMyBlocksByBlockGroupId(request);
        return {
          success: false,
          data: {
            rawArborizedEditableBlock,
          },
          exception: error.unWrap,
          embedded: { publicId: "" },
        };
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlocksByBlockGroupIdResponse, Error>({
    queryKey: queryKeys.block.manyByBlockGroupId(
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
    callbackRequest: GetMyBlocksByBlockGroupIdRequest
  ): Promise<GetMyBlocksByBlockGroupIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockGroupId(
        callbackRequest.param.blockGroupId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useGetMyBlocksByBlockGroupIds = (
  hookRequest?: GetMyBlocksByBlockGroupIdsRequest,
  options?: Partial<UseQueryOptions<GetMyBlocksByBlockGroupIdsResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyBlocksByBlockGroupIdsRequest
  ): Promise<GetMyBlocksByBlockGroupIdsResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      const response = await queryFnGetMyBlocksByBlockGroupIds(request);
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
        request.param.blockGroupIds.forEach((blockGroupId, index) => {
          queryClient.setQueriesData(
            {
              queryKey: queryKeys.block.manyByBlockGroupId(
                blockGroupId as UUID
              ),
            },
            duplicateResponse(response, undefined, response.data[index])
          );
        });
      }
      await BlockLocalSynchronizer.syncGetMyBlocksByBlockGroupIds(
        request,
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const rawArborizedEditableBlocks =
          await BlockLocalSimulator.simulateGetMyBlocksByBlockGroupIds(request);
        return {
          success: false,
          data: rawArborizedEditableBlocks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyBlocksByBlockGroupIdsResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyBlocksByBlockGroupIdsResponse, Error>({
    queryKey: queryKeys.block.manyByBlockGroupIds(
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
    callbackRequest: GetMyBlocksByBlockGroupIdsRequest
  ): Promise<GetMyBlocksByBlockGroupIdsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockGroupIds(
        callbackRequest.param.blockGroupIds as UUID[] | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
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
      const response = await queryFnGetMyBlocksByBlockPackId(request);
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
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyBlocksByBlockPackIdRequest
  ): Promise<GetMyBlocksByBlockPackIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.block.manyByBlockPackId(
        callbackRequest.param.blockPackId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
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
      const response = await queryFnGetAllMyBlocks(request);
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
      await BlockLocalSynchronizer.syncGetAllMyBlocks(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const existingBlocks =
          await BlockLocalSimulator.simulateGetAllMyBlocks();
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
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyBlocksRequest
  ): Promise<GetAllMyBlocksResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.block.myAll(),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useInsertBlock = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlock,
    onSuccess: async (response, request) => {
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
      const targetKeys: QueryKey[] = [
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroup.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.manyByPrevBlockGroupId(blockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        queryKeys.block.myAll(),
      ];
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData?.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount: oldData.data.blockCount + 1,
            },
          };
        }
      );
      Promise.all(
        targetKeys.map(targetKey => {
          queryClient.invalidateQueries({ queryKey: targetKey });
        })
      );
      await BlockLocalSynchronizer.syncInsertBlock(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateInsertBlock(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useInsertBlocks = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnInsertBlocks,
    onSuccess: async (response, request) => {
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
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIds = request.affected.blockPackIds as UUID[];
      const targetKeys: QueryKey[] = [
        ...blockPackIds.flatMap(blockPackId => [
          queryKeys.block.manyByBlockPackId(blockPackId),
          queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
          queryKeys.blockPackWithBlockGroup.oneById(blockPackId),
        ]),
        queryKeys.block.myAll(),
      ] as any[];
      response.data.successBlockGroupAndBlockIds.forEach(
        blockGroupAndBlocks => {
          if (!blockGroupIdsSet.has(blockGroupAndBlocks.blockGroupId as UUID)) {
            blockGroupIdsSet.add(blockGroupAndBlocks.blockGroupId as UUID);
            targetKeys.push(
              queryKeys.block.manyByBlockGroupId(
                blockGroupAndBlocks.blockGroupId as UUID
              ),
              queryKeys.blockGroup.oneById(
                blockGroupAndBlocks.blockGroupId as UUID
              )
            );
            queryKeys.blockGroupWithBlock.oneById(
              blockGroupAndBlocks.blockGroupId as UUID
            );
          }
        }
      );
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
      blockPackIds.forEach(blockPackId => {
        queryClient.setQueryData(
          queryKeys.blockPack.oneById(blockPackId),
          (oldData: GetMyBlockPackByIdResponse | undefined) => {
            if (!oldData?.success) return oldData;

            return {
              ...oldData,
              data: {
                ...oldData.data,
                blockCount:
                  oldData.data.blockCount + response.data.successIndexes.length,
              },
            };
          }
        );
      });
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockLocalSynchronizer.syncInsertBlocks(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateInsertBlocks(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyBlockById,
    onSuccess: async (response, request) => {
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
      const blockGroupId = request.affected.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.block.myAll(),
      ];
      Promise.all(
        targetKeys.map(targetKey => {
          queryClient.invalidateQueries({ queryKey: targetKey });
        })
      );
      await BlockLocalSynchronizer.syncUpdateMyBlockById(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateUpdateMyBlockById(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useUpdateMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyBlocksByIds,
    onSuccess: async (response, request) => {
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
      const blockPackIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      request.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(
            queryKeys.block.manyByBlockPackId(blockPackId as UUID),
            queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId as UUID)
          );
        }
      });
      response.data.successBlockGroupAndBlockIds.forEach(
        blockGroupAndBlocks => {
          if (!blockGroupIdsSet.has(blockGroupAndBlocks.blockGroupId as UUID)) {
            blockGroupIdsSet.add(blockGroupAndBlocks.blockGroupId as UUID);
            targetKeys.push(
              queryKeys.block.manyByBlockGroupId(
                blockGroupAndBlocks.blockGroupId as UUID
              ),
              queryKeys.blockGroupWithBlock.oneById(
                blockGroupAndBlocks.blockGroupId as UUID
              )
            );
          }
          blockGroupAndBlocks.blockIds.forEach(blockId => {
            if (!blockIdsSet.has(blockId as UUID)) {
              blockIdsSet.add(blockId as UUID);
              targetKeys.push(queryKeys.block.oneById(blockId as UUID));
            }
          });
        }
      );
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockLocalSynchronizer.syncUpdateMyBlocksByIds(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateUpdateMyBlocksByIds(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlockById,
    onSuccess: async (response, request) => {
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
      const blockId = request.body.blockId as UUID;
      const blockGroupId = response.data.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [queryKeys.block.oneById(blockId)];
      targetKeys.push(
        queryKeys.block.oneById(blockId),
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.block.myAll()
      );
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData?.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount: oldData.data.blockCount + 1,
            },
          };
        }
      );
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockLocalSynchronizer.syncRestoreMyBlockById(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateRestoreMyBlockById(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useRestoreMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyBlocksByIds,
    onSuccess: async (response, request) => {
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
      const blockIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      request.body.blockIds.forEach(blockId => {
        if (!blockIdsSet.has(blockId as UUID)) {
          blockIdsSet.add(blockId as UUID);
          targetKeys.push(queryKeys.block.oneById(blockId as UUID));
        }
      });
      request.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(queryKeys.blockPack.oneById(blockPackId as UUID));
        }
      });
      response.data.forEach(block => {
        if (!blockGroupIdsSet.has(block.blockGroupId as UUID)) {
          blockGroupIdsSet.add(block.blockGroupId as UUID);
          targetKeys.push(
            queryKeys.block.manyByBlockGroupId(block.blockGroupId as UUID),
            queryKeys.blockGroup.oneById(block.blockGroupId as UUID)
          );
        }
      });
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockLocalSynchronizer.syncRestoreMyBlocksByIds(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateRestoreMyBlocksByIds(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyBlockById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyBlockById,
    onSuccess: async (response, request) => {
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
      const blockId = request.body.blockId as UUID;
      const blockGroupId = request.affected.blockGroupId as UUID;
      const blockPackId = request.affected.blockPackId as UUID;
      const targetKeys: QueryKey[] = [
        queryKeys.block.oneById(blockId),
        queryKeys.block.manyByBlockGroupId(blockGroupId),
        queryKeys.block.manyByBlockPackId(blockPackId),
        queryKeys.blockGroup.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.oneById(blockGroupId),
        queryKeys.blockGroupWithBlock.manyByBlockPackId(blockPackId),
        queryKeys.block.myAll(),
      ];
      queryClient.setQueryData(
        queryKeys.blockPack.oneById(blockPackId),
        (oldData: GetMyBlockPackByIdResponse | undefined) => {
          if (!oldData?.success) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              blockCount: oldData.data.blockCount - 1,
            },
          };
        }
      );
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockLocalSynchronizer.syncDeleteMyBlockById(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateDeleteMyBlockById(request);
            break;
        }
      }
    },
  });

  return mutation;
};

export const useDeleteMyBlocksByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyBlocksByIds,
    onSuccess: async (response, request) => {
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
      const blockIdsSet = new Set<UUID>();
      const blockGroupIdsSet = new Set<UUID>();
      const blockPackIdsSet = new Set<UUID>();
      const targetKeys: QueryKey[] = [queryKeys.block.myAll()];
      request.body.blockIds.forEach(blockId => {
        if (!blockIdsSet.has(blockId as UUID)) {
          blockIdsSet.add(blockId as UUID);
          targetKeys.push(queryKeys.block.oneById(blockId as UUID));
        }
      });
      request.affected.blockPackIds.forEach(blockPackId => {
        if (!blockPackIdsSet.has(blockPackId as UUID)) {
          blockPackIdsSet.add(blockPackId as UUID);
          targetKeys.push(queryKeys.blockPack.oneById(blockPackId as UUID));
        }
      });
      request.affected.blockGroupIds.forEach(blockGroupId => {
        if (!blockGroupIdsSet.has(blockGroupId as UUID)) {
          blockGroupIdsSet.add(blockGroupId as UUID);
          targetKeys.push(
            queryKeys.block.manyByBlockGroupId(blockGroupId as UUID),
            queryKeys.blockGroup.oneById(blockGroupId as UUID)
          );
        }
      });
      targetKeys.push(
        queryKeys.blockGroupWithBlock.manyByIds([...blockGroupIdsSet])
      );
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      await BlockLocalSynchronizer.syncDeleteMyBlocksByIds(request, response);
    },
    onError: async (error, request) => {
      if (error instanceof NotezyFetchError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.client.fetch.missingNetwork:
            await BlockLocalSimulator.simulateDeleteMyBlocksByIds(request);
            break;
        }
      }
    },
  });

  return mutation;
};
