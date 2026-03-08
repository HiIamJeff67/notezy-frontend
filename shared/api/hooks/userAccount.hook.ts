import { queryFnGetMyAccount } from "@shared/api/functions/userAccount.function";
import {
  QueryAsyncDefaultOptions,
  UseQueryDefaultOptions,
} from "@shared/api/interfaces/queryHookOptions";
import {
  BindGoogleAccountRequest,
  BindGoogleAccountRequestSchema,
  BindGoogleAccountResponse,
  GetMyAccountRequest,
  GetMyAccountResponse,
  UnbindGoogleAccountRequest,
  UnbindGoogleAccountRequestSchema,
  UnbindGoogleAccountResponse,
  UpdateMyAccountRequest,
  UpdateMyAccountRequestSchema,
  UpdateMyAccountResponse,
} from "@shared/api/interfaces/userAccount.interface";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { tKey } from "@shared/translations";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { SessionStorageKeys } from "@shared/types/sessionStorage.type";
import {
  FetchQueryOptions,
  useMutation,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { ZodError } from "zod";
import { ExceptionReasonDictionary, NotezyAPIError } from "../exceptions";
import {
  BindGoogleAccount,
  UnbindGoogleAccount,
  UpdateMyAccount,
} from "../invokers/userAccount.invoker";

export const useGetMyAccount = (
  hookRequest?: GetMyAccountRequest,
  options?: Partial<UseQueryOptions>
) => {
  const queryClient = getQueryClient();

  const query = useQuery({
    queryKey: queryKeys.userAccount.my(),
    queryFn: async () => await queryFnGetMyAccount(hookRequest),
    staleTime: UseQueryDefaultOptions.staleTime,
    refetchOnWindowFocus: UseQueryDefaultOptions.refetchOnWindowFocus,
    refetchOnMount: UseQueryDefaultOptions.refetchOnMount,
    ...options,
    enabled: !!hookRequest && options && options.enabled,
  });

  const queryAsync = async (
    callbackRequest: GetMyAccountRequest,
    options?: Partial<FetchQueryOptions>
  ): Promise<GetMyAccountResponse> => {
    const response = await queryClient.fetchQuery({
      queryKey: queryKeys.userAccount.my(),
      queryFn: async () => await queryFnGetMyAccount(callbackRequest),
      staleTime: QueryAsyncDefaultOptions.staleTime,
      ...options,
    });
    return response as GetMyAccountResponse;
  };

  return {
    ...query,
    queryAsync,
    name: "GET_MY_ACCOUNT_HOOK" as const,
  };
};

export const useUpdateMyAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UpdateMyAccountRequest
    ): Promise<UpdateMyAccountResponse> => {
      const validatedRequest = UpdateMyAccountRequestSchema.parse(request);
      return await UpdateMyAccount(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKeys.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKeys.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.user.notFound:
            throw new Error(tKey.error.apiError.getUser.failedToGetUser);
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UPDATE_MY_ACCOUNT_HOOK" as const,
  };
};

export const useBindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: BindGoogleAccountRequest
    ): Promise<BindGoogleAccountResponse> => {
      const validatedRequest = BindGoogleAccountRequestSchema.parse(request);
      return BindGoogleAccount(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKeys.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKeys.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.user.notFound:
            throw new Error(tKey.error.apiError.getUser.failedToGetUser);
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "BIND_GOOGLE_ACCOUNT_HOOK" as const,
  };
};

export const useUnbindGoogleAccount = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: UnbindGoogleAccountRequest
    ): Promise<UnbindGoogleAccountResponse> => {
      const validatedRequest = UnbindGoogleAccountRequestSchema.parse(request);
      return UnbindGoogleAccount(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount.my() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKeys.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKeys.csrfToken,
          response.newCSRFToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.user.notFound:
            throw new Error(tKey.error.apiError.getUser.failedToGetUser);
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "UNBIND_GOOGLE_ACCOUNT_HOOK" as const,
  };
};
