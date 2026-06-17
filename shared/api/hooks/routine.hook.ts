import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  BulkLinkRoutineItemsByIdsRequest,
  BulkLinkRoutineTagsByIdsRequest,
  BulkLinkRoutineTasksByIdsRequest,
  CreateRoutineByStationIdRequest,
  CreateRoutinesByStationIdsRequest,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutinesByIdsRequest,
  GetAllMyRoutinesByTimeRangeRequest,
  GetAllMyRoutinesByTimeRangeResponse,
  GetMyRoutineByIdRequest,
  GetMyRoutineByIdResponse,
  HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutinesByIdsRequest,
  LinkRoutineItemByIdRequest,
  LinkRoutineTagByIdRequest,
  LinkRoutineTaskByIdRequest,
  RestoreMyRoutineByIdRequest,
  RestoreMyRoutinesByIdsRequest,
  UpdateMyRoutineByIdRequest,
  UpdateMyRoutinesByIdsRequest,
} from "@shared/api/interfaces/routine.interface";
import {
  mutationFnBulkLinkRoutineItemsByIds,
  mutationFnBulkLinkRoutineTagsByIds,
  mutationFnBulkLinkRoutineTasksByIds,
  mutationFnCreateRoutineByStationId,
  mutationFnCreateRoutinesByStationIds,
  mutationFnDeleteMyRoutineById,
  mutationFnDeleteMyRoutinesByIds,
  mutationFnHardDeleteMyRoutineById,
  mutationFnHardDeleteMyRoutinesByIds,
  mutationFnLinkRoutineItemById,
  mutationFnLinkRoutineTagById,
  mutationFnLinkRoutineTaskById,
  mutationFnRestoreMyRoutineById,
  mutationFnRestoreMyRoutinesByIds,
  mutationFnUpdateMyRoutineById,
  mutationFnUpdateMyRoutinesByIds,
  queryFnGetAllMyRoutinesByTimeRange,
  queryFnGetMyRoutineById,
} from "@shared/api/invokers/routine.invoker";
import { RoutineLocalSimulator } from "@shared/api/local/simulators/routine.simulator";
import { RoutineLocalSynchronizer } from "@shared/api/local/synchronizers/routine.synchronizer";
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

export const useGetMyRoutineById = (
  hookRequest?: GetMyRoutineByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineByIdRequest
  ): Promise<GetMyRoutineByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineById(request);
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
      await RoutineLocalSynchronizer.syncGetMyRoutineById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routine =
          await RoutineLocalSimulator.simulateGetMyRoutineById(request);
        return {
          success: false,
          data: routine,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRoutineByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutineByIdResponse, Error>({
    queryKey: queryKeys.routine.oneById(
      hookRequest?.param.routineId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyRoutineByIdRequest
  ): Promise<GetMyRoutineByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routine.oneById(
        callbackRequest.param.routineId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMyRoutinesByTimeRange = (
  hookRequest?: GetAllMyRoutinesByTimeRangeRequest,
  options?: Partial<UseQueryOptions<GetAllMyRoutinesByTimeRangeResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutinesByTimeRangeRequest
  ): Promise<GetAllMyRoutinesByTimeRangeResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutinesByTimeRange(request);
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
      await RoutineLocalSynchronizer.syncGetAllMyRoutinesByTimeRange(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routines =
          await RoutineLocalSimulator.simulateGetAllMyRoutinesByTimeRange(
            request
          );
        return {
          success: false,
          data: routines,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutinesByTimeRangeResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutinesByTimeRangeResponse, Error>({
    queryKey: queryKeys.routine.manyByTimeRange(
      hookRequest?.param.from,
      hookRequest?.param.to,
      hookRequest?.param.stationIds as UUID[] | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyRoutinesByTimeRangeRequest
  ): Promise<GetAllMyRoutinesByTimeRangeResponse> => {
    const requestedFromTime = callbackRequest.param.from.getTime();
    const requestedToTime = callbackRequest.param.to.getTime();
    const requestedStationIdsKey = callbackRequest.param.stationIds
      .slice()
      .sort()
      .join(",");
    const coveredCachedQuery = queryClient
      .getQueryCache()
      .findAll({ queryKey: queryKeys.routine.all() })
      .find(query => {
        const queryKey = query.queryKey as readonly unknown[];
        if (queryKey[1] !== "manyByTimeRange") return false;
        if (query.state.isInvalidated || !query.state.data) return false;
        if (queryKey[4] !== requestedStationIdsKey) return false;

        const cachedFromTime =
          typeof queryKey[2] === "number"
            ? queryKey[2]
            : typeof queryKey[2] === "string"
              ? new Date(queryKey[2]).getTime()
              : Number.NaN;
        const cachedToTime =
          typeof queryKey[3] === "number"
            ? queryKey[3]
            : typeof queryKey[3] === "string"
              ? new Date(queryKey[3]).getTime()
              : Number.NaN;

        return (
          Number.isFinite(cachedFromTime) &&
          Number.isFinite(cachedToTime) &&
          cachedFromTime <= requestedFromTime &&
          cachedToTime >= requestedToTime
        );
      });

    if (coveredCachedQuery?.state.data) {
      return coveredCachedQuery.state
        .data as GetAllMyRoutinesByTimeRangeResponse;
    }

    return queryClient.fetchQuery({
      queryKey: queryKeys.routine.manyByTimeRange(
        callbackRequest.param.from,
        callbackRequest.param.to,
        callbackRequest.param.stationIds as UUID[]
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateRoutineByStationId = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutineByStationIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateRoutineByStationId(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutineByStationIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(response.data.id as UUID),
        queryKeys.station.oneById(request.body.stationId as UUID),
        queryKeys.routine.manyByStationId(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncCreateRoutineByStationId(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateCreateRoutineByStationId(request);
      }
    },
  });

  return mutation;
};

export const useCreateRoutinesByStationIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: CreateRoutinesByStationIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnCreateRoutinesByStationIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: CreateRoutinesByStationIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...response.data.ids.map(id => queryKeys.routine.oneById(id as UUID)),
        ...request.body.createdRoutines.map(routine =>
          queryKeys.station.oneById(routine.stationId as UUID)
        ),
        ...request.body.createdRoutines.map(routine =>
          queryKeys.routine.manyByStationId(routine.stationId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncCreateRoutinesByStationIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateCreateRoutinesByStationIds(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutineByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncUpdateMyRoutineById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateUpdateMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useUpdateMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: UpdateMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnUpdateMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: UpdateMyRoutinesByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.updatedRoutines.map(routine =>
          queryKeys.routine.oneById(routine.routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncUpdateMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateUpdateMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};

export const useLinkRoutineTagById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineTagByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnLinkRoutineTagById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineTagByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncLinkRoutineTagById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateLinkRoutineTagById(request);
      }
    },
  });

  return mutation;
};

export const useBulkLinkRoutineTagsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: BulkLinkRoutineTagsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnBulkLinkRoutineTagsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: BulkLinkRoutineTagsByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.linkedRoutinesAndTags.map(item =>
          queryKeys.routine.oneById(item.routineId as UUID)
        ),
        ...request.body.linkedRoutinesAndTags.map(item =>
          queryKeys.routineTag.oneById(item.routineTagId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncBulkLinkRoutineTagsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateBulkLinkRoutineTagsByIds(request);
      }
    },
  });

  return mutation;
};

export const useLinkRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnLinkRoutineTaskById,
    onSuccess: async (response, request: LinkRoutineTaskByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useBulkLinkRoutineTasksByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnBulkLinkRoutineTasksByIds,
    onSuccess: async (response, request: BulkLinkRoutineTasksByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.linkedRoutinesAndTasks.map(item =>
          queryKeys.routine.oneById(item.routineId as UUID)
        ),
        ...request.body.linkedRoutinesAndTasks.map(item =>
          queryKeys.routineTask.oneById(item.routineTaskId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineItemById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: LinkRoutineItemByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnLinkRoutineItemById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: LinkRoutineItemByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchItems" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncLinkRoutineItemById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateLinkRoutineItemById(request);
      }
    },
  });

  return mutation;
};

export const useBulkLinkRoutineItemsByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: BulkLinkRoutineItemsByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnBulkLinkRoutineItemsByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: BulkLinkRoutineItemsByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        ...request.body.linkedRoutinesAndItems.map(item =>
          queryKeys.routine.oneById(item.routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchItems" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncBulkLinkRoutineItemsByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateBulkLinkRoutineItemsByIds(request);
      }
    },
  });

  return mutation;
};

export const useRestoreMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnRestoreMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyRoutineByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncRestoreMyRoutineById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateRestoreMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useRestoreMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: RestoreMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnRestoreMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: RestoreMyRoutinesByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncRestoreMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateRestoreMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};

export const useDeleteMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnDeleteMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyRoutineByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncDeleteMyRoutineById(request, response);
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateDeleteMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useDeleteMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: DeleteMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnDeleteMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: DeleteMyRoutinesByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncDeleteMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateDeleteMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutineById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutineByIdRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyRoutineById(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutineByIdRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        queryKeys.routine.oneById(request.body.routineId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncHardDeleteMyRoutineById(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateHardDeleteMyRoutineById(request);
      }
    },
  });

  return mutation;
};

export const useHardDeleteMyRoutinesByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const perform = async (request: HardDeleteMyRoutinesByIdsRequest) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }
    return await mutationFnHardDeleteMyRoutinesByIds(request);
  };

  const mutation = useMutation({
    mutationFn: perform,
    onSuccess: async (response, request: HardDeleteMyRoutinesByIdsRequest) => {
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
      const targetKeys = [
        queryKeys.routine.all(),
        queryKeys.station.all(),
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.evict({ fieldName: "searchRoutineTags" });
      apolloClient.cache.gc();
      await RoutineLocalSynchronizer.syncHardDeleteMyRoutinesByIds(
        request,
        response
      );
    },
    onError: async (error, request) => {
      if (
        error instanceof NotezyFetchError &&
        error.unWrap.reason ===
          ExceptionReasonDictionary.client.fetch.missingNetwork
      ) {
        await RoutineLocalSimulator.simulateHardDeleteMyRoutinesByIds(request);
      }
    },
  });

  return mutation;
};
