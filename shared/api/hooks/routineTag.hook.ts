import type { UUID } from "node:crypto";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import type {
  CreateRoutineTagRequest,
  CreateRoutineTagsRequest,
  GetMyRoutineTagByIdRequest,
  GetMyRoutineTagByIdResponse,
  HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagsByIdsRequest,
} from "@shared/api/interfaces/routineTag.interface";
import {
  mutationFnCreateRoutineTag,
  mutationFnCreateRoutineTags,
  mutationFnHardDeleteMyRoutineTagById,
  mutationFnHardDeleteMyRoutineTagsByIds,
  mutationFnUpdateMyRoutineTagById,
  mutationFnUpdateMyRoutineTagsByIds,
  queryFnGetMyRoutineTagById,
} from "@shared/api/invokers/routineTag.invoker";
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

export const useGetMyRoutineTagById = (
  hookRequest?: GetMyRoutineTagByIdRequest,
  options?: Partial<UseQueryOptions<GetMyRoutineTagByIdResponse, Error>>
) => {
  const queryClient = getQueryClient();

  const perform = async (
    request?: GetMyRoutineTagByIdRequest
  ): Promise<GetMyRoutineTagByIdResponse> => {
    if (!request) {
      throw new NotezyValidationError(
        ValidationClientException.ReceivedUndefinedRequest()
      );
    }

    const response = await queryFnGetMyRoutineTagById(request);
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

  const query = useQuery<GetMyRoutineTagByIdResponse, Error>({
    queryKey: queryKeys.routineTag.oneById(
      hookRequest?.param.routineTagId as UUID | undefined
    ),
    queryFn: async () => perform(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: hookRequest ? (options?.enabled ?? true) : false,
  });

  const fetch = async (
    callbackRequest: GetMyRoutineTagByIdRequest
  ): Promise<GetMyRoutineTagByIdResponse> => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.routineTag.oneById(
        callbackRequest.param.routineTagId as UUID | undefined
      ),
      queryFn: async () => perform(callbackRequest),
      staleTime: UseQueryDefaultOptions.staleTime,
      ...options,
    });
  };

  return { ...(hookRequest ? query : {}), fetch };
};

export const useCreateRoutineTag = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRoutineTag,
    onSuccess: async (response, request: CreateRoutineTagRequest) => {
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
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(response.data.id as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useCreateRoutineTags = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnCreateRoutineTags,
    onSuccess: async (response, request: CreateRoutineTagsRequest) => {
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
        queryKeys.routineTag.all(),
        ...response.data.ids.map(id =>
          queryKeys.routineTag.oneById(id as UUID)
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

export const useUpdateMyRoutineTagById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRoutineTagById,
    onSuccess: async (response, request: UpdateMyRoutineTagByIdRequest) => {
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
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(request.body.routineTagId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useUpdateMyRoutineTagsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnUpdateMyRoutineTagsByIds,
    onSuccess: async (response, request: UpdateMyRoutineTagsByIdsRequest) => {
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
        queryKeys.routineTag.all(),
        ...request.body.updatedRoutineTags.map(tag =>
          queryKeys.routineTag.oneById(tag.routineTagId as UUID)
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

export const useHardDeleteMyRoutineTagById = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineTagById,
    onSuccess: async (response, request: HardDeleteMyRoutineTagByIdRequest) => {
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
        queryKeys.routineTag.all(),
        queryKeys.routineTag.oneById(request.body.routineTagId as UUID),
      ];
      await Promise.all(
        targetKeys.map(queryKey => queryClient.invalidateQueries({ queryKey }))
      );
    },
    onError: error => {},
  });

  return mutation;
};

export const useHardDeleteMyRoutineTagsByIds = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: mutationFnHardDeleteMyRoutineTagsByIds,
    onSuccess: async (
      response,
      request: HardDeleteMyRoutineTagsByIdsRequest
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
        queryKeys.routineTag.all(),
        ...request.body.routineTagIds.map(routineTagId =>
          queryKeys.routineTag.oneById(routineTagId as UUID)
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
