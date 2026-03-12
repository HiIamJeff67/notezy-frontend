import { useApolloClient } from "@apollo/client/react";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import {
  DeleteMeRequest,
  DeleteMeRequestSchema,
  DeleteMeResponse,
  ForgetPasswordRequest,
  ForgetPasswordRequestSchema,
  ForgetPasswordResponse,
  LoginRequest,
  LoginRequestSchema,
  LoginResponse,
  LoginViaGoogleRequest,
  LoginViaGoogleRequestSchema,
  LoginViaGoogleResponse,
  LogoutRequest,
  LogoutRequestSchema,
  LogoutResponse,
  RegisterRequest,
  RegisterRequestSchema,
  RegisterResponse,
  RegisterViaGoogleRequest,
  RegisterViaGoogleRequestSchema,
  RegisterViaGoogleResponse,
  ResetEmailRequest,
  ResetEmailRequestSchema,
  ResetEmailResponse,
  ResetMeRequest,
  ResetMeRequestSchema,
  ResetMeResponse,
  SendAuthCodeRequest,
  SendAuthCodeRequestSchema,
  SendAuthCodeResponse,
  ValidateEmailRequest,
  ValidateEmailRequestSchema,
  ValidateEmailResponse,
} from "@shared/api/interfaces/auth.interface";
import {
  DeleteMe,
  ForgetPassword,
  Login,
  LoginViaGoogle,
  Logout,
  Register,
  RegisterViaGoogle,
  ResetEmail,
  ResetMe,
  SendAuthCode,
  ValidateEmail,
} from "@shared/api/invokers/auth.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { tKey } from "@shared/translations";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { QueryKey, useMutation } from "@tanstack/react-query";
import { ZodError } from "zod";

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RegisterRequest): Promise<RegisterResponse> => {
      const validatedRequest = RegisterRequestSchema.parse(request);
      return await Register(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.data.accessToken
      );
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.data.csrfToken
      );
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          case ExceptionReasonDictionary.user.duplicateName:
            throw new Error(tKey.error.apiError.register.duplicateName);
          case ExceptionReasonDictionary.user.duplicateEmail:
            throw new Error(tKey.error.apiError.register.duplicateEmail);
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "REGISTER_HOOK" as const,
  };
};

export const useRegisterViaGoogle = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: RegisterViaGoogleRequest
    ): Promise<RegisterViaGoogleResponse> => {
      const validatedRequest = RegisterViaGoogleRequestSchema.parse(request);
      return await RegisterViaGoogle(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.data.accessToken
      );
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.data.csrfToken
      );
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
    name: "REGISTER_VIA_GOOGLE_HOOK" as const,
  };
};

export const useLogin = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: LoginRequest): Promise<LoginResponse> => {
      const validatedRequest = LoginRequestSchema.parse(request);
      return await Login(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.data.accessToken
      );
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.data.csrfToken
      );
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
    name: "LOGIN_HOOK" as const,
  };
};

export const useLoginViaGoogle = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: LoginViaGoogleRequest
    ): Promise<LoginViaGoogleResponse> => {
      const validatedRequest = LoginViaGoogleRequestSchema.parse(request);
      return await LoginViaGoogle(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.data.accessToken
      );
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.data.csrfToken
      );
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
    name: "LOGIN_VIA_GOOGLE_HOOK" as const,
  };
};

export const useLogout = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: async (request: LogoutRequest): Promise<LogoutResponse> => {
      const validatedRequest = LogoutRequestSchema.parse(request);
      return await Logout(validatedRequest);
    },
    onSuccess: _ => {
      queryClient.removeQueries();
      apolloClient.clearStore();
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      } else if (error instanceof NotezyAPIError) {
        switch (error.unWrap.reason) {
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "LOGOUT_HOOK" as const,
  };
};

export const useSendAuthCode = () => {
  const mutation = useMutation({
    mutationFn: async (
      request: SendAuthCodeRequest
    ): Promise<SendAuthCodeResponse> => {
      const validatedRequest = SendAuthCodeRequestSchema.parse(request);
      return await SendAuthCode(validatedRequest);
    },
    onSuccess: (response, _) => {
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
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
    name: "SEND_AUTH_CODE_HOOK" as const,
  };
};

export const useValidateEmail = () => {
  const mutation = useMutation({
    mutationFn: async (
      request: ValidateEmailRequest
    ): Promise<ValidateEmailResponse> => {
      const validatedRequest = ValidateEmailRequestSchema.parse(request);
      return await ValidateEmail(validatedRequest);
    },
    onSuccess: (response, _) => {
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
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
    name: "VALIDATE_EMAIL_HOOK" as const,
  };
};

export const useResetEmail = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: ResetEmailRequest
    ): Promise<ResetEmailResponse> => {
      const validatedRequest = ResetEmailRequestSchema.parse(request);
      return await ResetEmail(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
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
    name: "RESET_EMAIL_HOOK" as const,
  };
};

export const useForgetPassword = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (
      request: ForgetPasswordRequest
    ): Promise<ForgetPasswordResponse> => {
      const validatedRequest = ForgetPasswordRequestSchema.parse(request);
      return await ForgetPassword(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
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
    name: "FORGET_PASSWORD_HOOK" as const,
  };
};

export const useResetMe = () => {
  const queryClient = getQueryClient();
  const apolloClient = useApolloClient();

  const mutation = useMutation({
    mutationFn: async (request: ResetMeRequest): Promise<ResetMeResponse> => {
      const validatedRequest = ResetMeRequestSchema.parse(request);
      return await ResetMe(validatedRequest);
    },
    onSuccess: (response, _) => {
      apolloClient.cache.evict({ fieldName: "searchRootShelves" });
      const targetKeys: QueryKey[] = [
        queryKeys.user.data(),
        queryKeys.userInfo.all(),
        queryKeys.rootShelf.all(),
        queryKeys.subShelf.all(),
        queryKeys.material.all(),
        queryKeys.blockPack.all(),
        queryKeys.blockGroup.all(),
        queryKeys.block.all(),
        queryKeys.blockPackWithBlockGroup.all(),
        queryKeys.blockGroupWithBlock.all(),
      ];
      Promise.all(
        targetKeys.map(targetKey =>
          queryClient.invalidateQueries({ queryKey: targetKey })
        )
      );
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKey.accessToken,
          response.newAccessToken
        );
      }
      if (response.newCSRFToken) {
        SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
        SessionStorageManipulator.setItem(
          SessionStorageKey.csrfToken,
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
          default:
            throw new Error(error.unWrap.message);
        }
      }
      throw error;
    },
  });

  return {
    ...mutation,
    name: "RESET_ME_HOOK" as const,
  };
};

export const useDeleteMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMeRequest): Promise<DeleteMeResponse> => {
      const validatedRequest = DeleteMeRequestSchema.parse(request);
      return await DeleteMe(validatedRequest);
    },
    onSuccess: _ => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
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
    name: "DELETE_ME_HOOK" as const,
  };
};
