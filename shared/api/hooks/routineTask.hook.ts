import type { UUID } from "node:crypto";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  CreateRoutineTaskByStationIdRequest,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTasksByIdsRequest,
  UpdateMyRoutineTaskByIdRequest,
} from "@shared/api/interfaces/routineTask.interface";
import {
  mutationFnCreateRoutineTaskByStationId,
  mutationFnHardDeleteMyRoutineTaskById,
  mutationFnHardDeleteMyRoutineTasksByIds,
  mutationFnUpdateMyRoutineTaskById,
  queryFnGetMyRoutineTaskById,
} from "@shared/api/invokers/routineTask.invoker";
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
    return response;
  };

  const query = useQuery<GetMyRoutineTaskByIdResponse, Error>({
    queryKey: queryKeys.routineTask.oneById(
      hookRequest?.param.routineTaskId as UUID | undefined
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
        callbackRequest.param.routineTaskId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateRoutineTaskByStationId = () => {
  const queryClient = getQueryClient();

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
        queryKeys.routineTask.oneById(response.data.id as UUID),
        queryKeys.station.oneById(request.body.stationId as UUID),
        queryKeys.routineTask.manyByStationId(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyRoutineTaskById = () => {
  const queryClient = getQueryClient();

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
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTaskById = () => {
  const queryClient = getQueryClient();

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
        queryKeys.routineTask.oneById(request.body.routineTaskId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTasksByIds = () => {
  const queryClient = getQueryClient();

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
        ...request.body.routineTaskIds.map(routineTaskId =>
          queryKeys.routineTask.oneById(routineTaskId as UUID)
        ),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};
