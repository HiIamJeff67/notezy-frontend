import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import {
  DeleteMeRequest,
  DeleteMeRequestSchema,
  ForgetPasswordRequest,
  ForgetPasswordRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  LogoutRequest,
  LogoutRequestSchema,
  RegisterRequest,
  RegisterRequestSchema,
  ResetEmailRequest,
  ResetEmailRequestSchema,
  SendAuthCodeRequest,
  SendAuthCodeRequestSchema,
  ValidateEmailRequest,
  ValidateEmailRequestSchema,
} from "@shared/api/interfaces/auth.interface";
import {
  DeleteMe,
  ForgetPassword,
  Login,
  Logout,
  Register,
  ResetEmail,
  SendAuthCode,
  ValidateEmail,
} from "@shared/api/invokers/auth.invoker";
import { getQueryClient } from "@shared/api/queryClient";
import { queryKeys } from "@shared/api/queryKeys";
import { tKey } from "@shared/translations";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { SessionStorageKeys } from "@shared/types/sessionStorage.type";
import { useMutation } from "@tanstack/react-query";
import { ZodError } from "zod";
import { ExceptionReasonDictionary, NotezyAPIError } from "../exceptions";

export const useRegister = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: RegisterRequest) => {
      const validatedRequest = RegisterRequestSchema.parse(request);
      return await Register(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.accessToken,
        response.data.accessToken
      );
      sessionStorage.removeItem(SessionStorageKeys.csrfToken);
      sessionStorage.setItem(
        SessionStorageKeys.csrfToken,
        response.data.csrfToken
      );
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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

export const useLogin = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: LoginRequest) => {
      const validatedRequest = LoginRequestSchema.parse(request);
      return await Login(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.accessToken,
        response.data.accessToken
      );
      sessionStorage.removeItem(SessionStorageKeys.csrfToken);
      sessionStorage.setItem(
        SessionStorageKeys.csrfToken,
        response.data.csrfToken
      );
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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

export const useLogout = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: LogoutRequest) => {
      const validatedRequest = LogoutRequestSchema.parse(request);
      return await Logout(validatedRequest);
    },
    onSuccess: _ => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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
    mutationFn: async (request: SendAuthCodeRequest) => {
      const validatedRequest = SendAuthCodeRequestSchema.parse(request);
      return await SendAuthCode(validatedRequest);
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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
    mutationFn: async (request: ValidateEmailRequest) => {
      const validatedRequest = ValidateEmailRequestSchema.parse(request);
      return await ValidateEmail(validatedRequest);
    },
    onSuccess: (response, _) => {
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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
    mutationFn: async (request: ResetEmailRequest) => {
      const validatedRequest = ResetEmailRequestSchema.parse(request);
      return await ResetEmail(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      if (response.newAccessToken) {
        LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
        LocalStorageManipulator.setItem(
          LocalStorageKeys.accessToken,
          response.newAccessToken
        );
      }
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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
    mutationFn: async (request: ForgetPasswordRequest) => {
      const validatedRequest = ForgetPasswordRequestSchema.parse(request);
      return await ForgetPassword(validatedRequest);
    },
    onSuccess: _ => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.data() });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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

export const useDeleteMe = () => {
  const queryClient = getQueryClient();

  const mutation = useMutation({
    mutationFn: async (request: DeleteMeRequest) => {
      const validatedRequest = DeleteMeRequestSchema.parse(request);
      return await DeleteMe(validatedRequest);
    },
    onSuccess: (response, _) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() });
    },
    onError: error => {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
        throw new Error(`validation failed : ${errorMessage}`);
      }
      if (error instanceof NotezyAPIError) {
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
