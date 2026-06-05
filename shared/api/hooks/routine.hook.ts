import type { UUID } from "node:crypto";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  BulkLinkRoutineItemsByIdsRequest,
  BulkLinkRoutineTagsByIdsRequest,
  BulkLinkRoutineTasksByIdsRequest,
  CreateRoutineByStationIdRequest,
  CreateRoutinesByStationIdsRequest,
  DeleteMyRoutineByIdRequest,
  DeleteMyRoutinesByIdsRequest,
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
  queryFnGetMyRoutineById,
} from "@shared/api/invokers/routine.invoker";
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
    return response;
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

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateRoutineByStationId = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRoutineByStationId,
    onSuccess: async (response, request: CreateRoutineByStationIdRequest) => {
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
        queryKeys.routine.oneById(response.data.id as UUID),
        queryKeys.station.oneById(request.body.stationId as UUID),
        queryKeys.routine.manyByStationId(request.body.stationId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useCreateRoutinesByStationIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRoutinesByStationIds,
    onSuccess: async (response, request: CreateRoutinesByStationIdsRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyRoutineById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRoutineById,
    onSuccess: async (response, request: UpdateMyRoutineByIdRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyRoutinesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRoutinesByIds,
    onSuccess: async (response, request: UpdateMyRoutinesByIdsRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineTagById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnLinkRoutineTagById,
    onSuccess: async (response, request: LinkRoutineTagByIdRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useBulkLinkRoutineTagsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBulkLinkRoutineTagsByIds,
    onSuccess: async (response, request: BulkLinkRoutineTagsByIdsRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineTaskById = () => {
  const queryClient = getQueryClient();

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
    },
    onError: error => {},
  });

  return mutation;
};

export const useBulkLinkRoutineTasksByIds = () => {
  const queryClient = getQueryClient();

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
    },
    onError: error => {},
  });

  return mutation;
};

export const useLinkRoutineItemById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnLinkRoutineItemById,
    onSuccess: async (response, request: LinkRoutineItemByIdRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useBulkLinkRoutineItemsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnBulkLinkRoutineItemsByIds,
    onSuccess: async (response, request: BulkLinkRoutineItemsByIdsRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyRoutineById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyRoutineById,
    onSuccess: async (response, request: RestoreMyRoutineByIdRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useRestoreMyRoutinesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnRestoreMyRoutinesByIds,
    onSuccess: async (response, request: RestoreMyRoutinesByIdsRequest) => {
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
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
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

export const useDeleteMyRoutineById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyRoutineById,
    onSuccess: async (response, request: DeleteMyRoutineByIdRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useDeleteMyRoutinesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnDeleteMyRoutinesByIds,
    onSuccess: async (response, request: DeleteMyRoutinesByIdsRequest) => {
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
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
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

export const useHardDeleteMyRoutineById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineById,
    onSuccess: async (response, request: HardDeleteMyRoutineByIdRequest) => {
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
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutinesByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutinesByIds,
    onSuccess: async (response, request: HardDeleteMyRoutinesByIdsRequest) => {
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
        ...request.body.routineIds.map(routineId =>
          queryKeys.routine.oneById(routineId as UUID)
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
