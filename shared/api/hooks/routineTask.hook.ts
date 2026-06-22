import type { UUID } from "node:crypto";
import { useApolloClient } from "@apollo/client/react";
import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  CreateRoutineTaskByStationIdRequest,
  GetAllMyRoutineTasksByStationIdsRequest,
  GetAllMyRoutineTasksByStationIdsResponse,
  GetAllMyRoutineTasksRequest,
  GetAllMyRoutineTasksResponse,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTasksByIdsRequest,
  UpdateMyRoutineTaskByIdRequest,
  VisualizeMyRoutineTaskActualEndedAtCountRequest,
  VisualizeMyRoutineTaskActualEndedAtCountResponse,
  VisualizeMyRoutineTaskActualStartedAtCountRequest,
  VisualizeMyRoutineTaskActualStartedAtCountResponse,
  VisualizeMyRoutineTaskPurposeCountRequest,
  VisualizeMyRoutineTaskPurposeCountResponse,
  VisualizeMyRoutineTaskScheduledAtCountRequest,
  VisualizeMyRoutineTaskScheduledAtCountResponse,
  VisualizeMyRoutineTaskStatusCountRequest,
  VisualizeMyRoutineTaskStatusCountResponse,
} from "@shared/api/interfaces/routineTask.interface";
import {
  mutationFnCreateRoutineTaskByStationId,
  mutationFnHardDeleteMyRoutineTaskById,
  mutationFnHardDeleteMyRoutineTasksByIds,
  mutationFnUpdateMyRoutineTaskById,
  queryFnGetAllMyRoutineTasks,
  queryFnGetAllMyRoutineTasksByStationIds,
  queryFnGetMyRoutineTaskById,
  queryFnVisualizeMyRoutineTaskActualEndedAtCount,
  queryFnVisualizeMyRoutineTaskActualStartedAtCount,
  queryFnVisualizeMyRoutineTaskPurposeCount,
  queryFnVisualizeMyRoutineTaskScheduledAtCount,
  queryFnVisualizeMyRoutineTaskStatusCount,
} from "@shared/api/invokers/routineTask.invoker";
import { RoutineTaskLocalSimulator } from "@shared/api/local/simulators/routineTask.simulator";
import { RoutineTaskLocalSynchronizer } from "@shared/api/local/synchronizers/routineTask.synchronizer";
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
import { useVisualizeQuery } from "./visualize.hook";

export const useVisualizeMyRoutineTaskStatusCount = (
  request?: VisualizeMyRoutineTaskStatusCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskStatusCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyStatusCount(
        currentRequest?.param.permission
      ),
    queryFnVisualizeMyRoutineTaskStatusCount,
    options
  );

export const useVisualizeMyRoutineTaskPurposeCount = (
  request?: VisualizeMyRoutineTaskPurposeCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskPurposeCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyPurposeCount(
        currentRequest?.param.permission
      ),
    queryFnVisualizeMyRoutineTaskPurposeCount,
    options
  );

export const useVisualizeMyRoutineTaskScheduledAtCount = (
  request?: VisualizeMyRoutineTaskScheduledAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskScheduledAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyScheduledAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineTaskScheduledAtCount,
    options
  );

export const useVisualizeMyRoutineTaskActualStartedAtCount = (
  request?: VisualizeMyRoutineTaskActualStartedAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskActualStartedAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyActualStartedAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineTaskActualStartedAtCount,
    options
  );

export const useVisualizeMyRoutineTaskActualEndedAtCount = (
  request?: VisualizeMyRoutineTaskActualEndedAtCountRequest,
  options?: Partial<
    UseQueryOptions<VisualizeMyRoutineTaskActualEndedAtCountResponse, Error>
  >
) =>
  useVisualizeQuery(
    request,
    currentRequest =>
      queryKeys.routineTask.visualizeMyActualEndedAtCount(
        currentRequest?.param.permission,
        currentRequest?.param.timeHourUnit,
        currentRequest?.param.queryRangeStartedAt,
        currentRequest?.param.queryRangeEndedAt
      ),
    queryFnVisualizeMyRoutineTaskActualEndedAtCount,
    options
  );

export const useGetMyRoutineTaskById = (
  hookRequest?: GetMyRoutineTaskByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineTaskByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineTaskByIdRequest
  ): Promise<GetMyRoutineTaskByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetMyRoutineTaskById(request);
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
      await RoutineTaskLocalSynchronizer.syncGetMyRoutineTaskById(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routineTask =
          await RoutineTaskLocalSimulator.simulateGetMyRoutineTaskById(request);
        return {
          success: false,
          data: routineTask,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetMyRoutineTaskByIdResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetMyRoutineTaskByIdResponse, Error>({
    queryKey: queryKeys.routineTask.oneById(
      hookRequest?.param.routineTaskId as UUID | undefined,
      hookRequest?.param.isDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyRoutineTaskByIdRequest
  ): Promise<GetMyRoutineTaskByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTask.oneById(
        callbackRequest.param.routineTaskId as UUID | undefined,
        callbackRequest.param.isDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMyRoutineTasksByStationIds = (
  hookRequest?: GetAllMyRoutineTasksByStationIdsRequest,
  options?: Partial<
    UseQueryOptions<GetAllMyRoutineTasksByStationIdsResponse, Error>
  >
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutineTasksByStationIdsRequest
  ): Promise<GetAllMyRoutineTasksByStationIdsResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTasksByStationIds(request);
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
      await RoutineTaskLocalSynchronizer.syncGetAllMyRoutineTasksByStationIds(
        response
      );
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routineTasks =
          await RoutineTaskLocalSimulator.simulateGetAllMyRoutineTasksByStationIds(
            request
          );
        return {
          success: false,
          data: routineTasks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutineTasksByStationIdsResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutineTasksByStationIdsResponse, Error>({
    queryKey: queryKeys.routineTask.manyByStationIds(
      hookRequest?.param.stationIds as UUID[] | undefined,
      hookRequest?.param.areDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyRoutineTasksByStationIdsRequest
  ): Promise<GetAllMyRoutineTasksByStationIdsResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTask.manyByStationIds(
        callbackRequest.param.stationIds as UUID[],
        callbackRequest.param.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useGetAllMyRoutineTasks = (
  hookRequest?: GetAllMyRoutineTasksRequest,
  options?: Partial<UseQueryOptions<GetAllMyRoutineTasksResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetAllMyRoutineTasksRequest
  ): Promise<GetAllMyRoutineTasksResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      const response = await queryFnGetAllMyRoutineTasks(request);
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
      await RoutineTaskLocalSynchronizer.syncGetAllMyRoutineTasks(response);
      return response;
    } catch (error) {
      if (
        error instanceof NotezyAPIError ||
        error instanceof NotezyFetchError
      ) {
        const routineTasks =
          await RoutineTaskLocalSimulator.simulateGetAllMyRoutineTasks(request);
        return {
          success: false,
          data: routineTasks,
          exception: error.unWrap,
          embedded: { publicId: "" },
        } as GetAllMyRoutineTasksResponse;
      }

      throw error;
    }
  };

  const query = useQuery<GetAllMyRoutineTasksResponse, Error>({
    queryKey: queryKeys.routineTask.myAll(
      hookRequest?.param?.areDeleted ?? false
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetAllMyRoutineTasksRequest
  ): Promise<GetAllMyRoutineTasksResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTask.myAll(
        callbackRequest.param?.areDeleted ?? false
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...query, fetch };
};

export const useCreateRoutineTaskByStationId = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRoutineTaskByStationId,
    onSuccess: async (
      response,
      request: CreateRoutineTaskByStationIdRequest
    ) => {
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
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(response.data.id as UUID),
        queryKeys.station.oneById(request.body.stationId as UUID),
        queryKeys.routineTask.manyByStationId(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRoutineTaskById,
    onSuccess: async (response, request: UpdateMyRoutineTaskByIdRequest) => {
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
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTaskById = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineTaskById,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTaskByIdRequest
    ) => {
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
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTasksByIds = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineTasksByIds,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTasksByIdsRequest
    ) => {
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
        queryKeys.routineTask.all(),
        queryKeys.routineTask.myAll(),
        ...request.body.routineTaskIds.map(routineTaskId =>
          queryKeys.routineTask.oneById(routineTaskId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
      apolloClient.cache.evict({ fieldName: "searchRoutineTasks" });
      apolloClient.cache.evict({ fieldName: "searchRoutines" });
      apolloClient.cache.evict({ fieldName: "searchStations" });
      apolloClient.cache.gc();
    },
    onError: error => {},
  });

  return mutation;
};
