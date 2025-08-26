import {
  ForgetPassword,
  Login,
  Logout,
  Register,
  SendAuthCode,
} from "@shared/api/functions/auth.api";
import {
  ForgetPasswordRequest,
  ForgetPasswordRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  LogoutRequest,
  LogoutRequestSchema,
  RegisterRequest,
  RegisterRequestSchema,
  SendAuthCodeRequest,
  SendAuthCodeRequestSchema,
} from "@shared/api/interfaces/auth.interface";
import { tKey } from "@shared/translations";
import { useMutation } from "@tanstack/react-query";
import { ZodError } from "zod";
import { ExceptionReasonDictionary, NotezyAPIError } from "../exceptions";

export const useRegister = () => {
  return useMutation({
    mutationFn: async (request: RegisterRequest) => {
      const validatedRequest = RegisterRequestSchema.parse(request);
      return await Register(validatedRequest);
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
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (request: LoginRequest) => {
      const validatedRequest = LoginRequestSchema.parse(request);
      return await Login(validatedRequest);
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
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async (request: LogoutRequest) => {
      const validatedRequest = LogoutRequestSchema.parse(request);
      return await Logout(validatedRequest);
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
};

export const useSendAuthCode = () => {
  return useMutation({
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
};

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: async (request: ForgetPasswordRequest) => {
      const validatedRequest = ForgetPasswordRequestSchema.parse(request);
      return await ForgetPassword(validatedRequest);
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
};
