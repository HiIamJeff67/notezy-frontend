import type { UUID } from "node:crypto";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  CreateStationRequest,
  CreateStationsRequest,
  DeleteMyStationByIdRequest,
  DeleteMyStationsByIdsRequest,
  GetMyStationByIdRequest,
  GetMyStationByIdResponse,
  HardDeleteMyStationByIdRequest,
  HardDeleteMyStationsByIdsRequest,
  RestoreMyStationByIdRequest,
  RestoreMyStationsByIdsRequest,
  UpdateMyStationByIdRequest,
  UpdateMyStationsByIdsRequest,
} from "@shared/api/interfaces/station.interface";
import {
  mutationFnCreateStation,
  mutationFnCreateStations,
  mutationFnDeleteMyStationById,
  mutationFnDeleteMyStationsByIds,
  mutationFnHardDeleteMyStationById,
  mutationFnHardDeleteMyStationsByIds,
  mutationFnRestoreMyStationById,
  mutationFnRestoreMyStationsByIds,
  mutationFnUpdateMyStationById,
  mutationFnUpdateMyStationsByIds,
  queryFnGetMyStationById,
} from "@shared/api/invokers/station.invoker";
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

export const useGetMyStationById = (
  hookRequest?: GetMyStationByIdRequest,
  options?: Partial<UseQueryOptions<GetMyStationByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyStationByIdRequest
  ): Promise<GetMyStationByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyStationById(request);
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

  const query = useQuery<GetMyStationByIdResponse, Error>({
    queryKey: queryKeys.station.oneById(
      hookRequest?.param.stationId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyStationByIdRequest
  ): Promise<GetMyStationByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.station.oneById(
        callbackRequest.param.stationId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateStation = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateStation,
    onSuccess: async (response, request: CreateStationRequest) => {
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
        queryKeys.station.all(),
        queryKeys.station.oneById(response.data.id as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useCreateStations = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateStations,
    onSuccess: async (response, request: CreateStationsRequest) => {
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
        queryKeys.station.all(),
        ...response.data.ids.map(id => queryKeys.station.oneById(id as UUID)),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyStationById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyStationById,
    onSuccess: async (response, request: UpdateMyStationByIdRequest) => {
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
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyStationsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyStationsByIds,
    onSuccess: async (response, request: UpdateMyStationsByIdsRequest) => {
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
        queryKeys.station.all(),
        ...request.body.updatedStations.map(station =>
          queryKeys.station.oneById(station.stationId as UUID)
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

export const useRestoreMyStationById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyStationById,
    onSuccess: async (response, request: RestoreMyStationByIdRequest) => {
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
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyStationsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyStationsByIds,
    onSuccess: async (response, request: RestoreMyStationsByIdsRequest) => {
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
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
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

export const useDeleteMyStationById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyStationById,
    onSuccess: async (response, request: DeleteMyStationByIdRequest) => {
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
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyStationsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyStationsByIds,
    onSuccess: async (response, request: DeleteMyStationsByIdsRequest) => {
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
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
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

export const useHardDeleteMyStationById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyStationById,
    onSuccess: async (response, request: HardDeleteMyStationByIdRequest) => {
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
        queryKeys.station.all(),
        queryKeys.station.oneById(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyStationsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyStationsByIds,
    onSuccess: async (response, request: HardDeleteMyStationsByIdsRequest) => {
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
        queryKeys.station.all(),
        ...request.body.stationIds.map(stationId =>
          queryKeys.station.oneById(stationId as UUID)
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
