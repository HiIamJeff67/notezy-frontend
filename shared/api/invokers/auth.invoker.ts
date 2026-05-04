import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import {
  DeleteMeServerFn,
  ForgetPasswordServerFn,
  LoginServerFn,
  LoginViaGoogleServerFn,
  LogoutServerFn,
  RegisterServerFn,
  RegisterViaGoogleServerFn,
  ResetEmailServerFn,
  ResetMeServerFn,
  SendAuthCodeServerFn,
  ValidateEmailServerFn,
} from "@shared/api/functions/auth.serverFn";
import {
  type DeleteMeRequest,
  DeleteMeRequestSchema,
  type DeleteMeResponse,
  DeleteMeResponseSchema,
  type ForgetPasswordRequest,
  ForgetPasswordRequestSchema,
  type ForgetPasswordResponse,
  ForgetPasswordResponseSchema,
  type LoginRequest,
  LoginRequestSchema,
  type LoginResponse,
  LoginResponseSchema,
  type LoginViaGoogleRequest,
  LoginViaGoogleRequestSchema,
  type LoginViaGoogleResponse,
  LoginViaGoogleResponseSchema,
  type LogoutRequest,
  LogoutRequestSchema,
  type LogoutResponse,
  LogoutResponseSchema,
  type RegisterRequest,
  RegisterRequestSchema,
  type RegisterResponse,
  RegisterResponseSchema,
  type RegisterViaGoogleRequest,
  RegisterViaGoogleRequestSchema,
  type RegisterViaGoogleResponse,
  RegisterViaGoogleResponseSchema,
  type ResetEmailRequest,
  ResetEmailRequestSchema,
  type ResetEmailResponse,
  ResetEmailResponseSchema,
  type ResetMeRequest,
  ResetMeRequestSchema,
  type ResetMeResponse,
  ResetMeResponseSchema,
  type SendAuthCodeRequest,
  SendAuthCodeRequestSchema,
  type SendAuthCodeResponse,
  SendAuthCodeResponseSchema,
  type ValidateEmailRequest,
  ValidateEmailRequestSchema,
  type ValidateEmailResponse,
  ValidateEmailResponseSchema,
} from "@shared/api/interfaces/auth.interface";
import { tKey } from "@shared/translations";
import { ZodError } from "zod";

export const mutationFnRegister = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const validatedRequest = RegisterRequestSchema.parse(request);
    const response = await RegisterServerFn({ data: validatedRequest });
    return RegisterResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnRegisterViaGoogle = async (
  request: RegisterViaGoogleRequest
): Promise<RegisterViaGoogleResponse> => {
  try {
    const validatedRequest = RegisterViaGoogleRequestSchema.parse(request);
    const response = await RegisterViaGoogleServerFn({
      data: validatedRequest,
    });
    return RegisterViaGoogleResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnLogin = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  try {
    const validatedRequest = LoginRequestSchema.parse(request);
    const response = await LoginServerFn({ data: validatedRequest });
    return LoginResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnLoginViaGoogle = async (
  request: LoginViaGoogleRequest
): Promise<LoginViaGoogleResponse> => {
  try {
    const validatedRequest = LoginViaGoogleRequestSchema.parse(request);
    const response = await LoginViaGoogleServerFn({ data: validatedRequest });
    return LoginViaGoogleResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnLogout = async (
  request: LogoutRequest
): Promise<LogoutResponse> => {
  try {
    const validatedRequest = LogoutRequestSchema.parse(request);
    const response = await LogoutServerFn({ data: validatedRequest });
    return LogoutResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      throw new Error(error.unWrap.message);
    }

    throw error;
  }
};

export const mutationFnSendAuthCode = async (
  request: SendAuthCodeRequest
): Promise<SendAuthCodeResponse> => {
  try {
    const validatedRequest = SendAuthCodeRequestSchema.parse(request);
    const response = await SendAuthCodeServerFn({ data: validatedRequest });
    return SendAuthCodeResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnValidateEmail = async (
  request: ValidateEmailRequest
): Promise<ValidateEmailResponse> => {
  try {
    const validatedRequest = ValidateEmailRequestSchema.parse(request);
    const response = await ValidateEmailServerFn({ data: validatedRequest });
    return ValidateEmailResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnResetEmail = async (
  request: ResetEmailRequest
): Promise<ResetEmailResponse> => {
  try {
    const validatedRequest = ResetEmailRequestSchema.parse(request);
    const response = await ResetEmailServerFn({ data: validatedRequest });
    return ResetEmailResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnForgetPassword = async (
  request: ForgetPasswordRequest
): Promise<ForgetPasswordResponse> => {
  try {
    const validatedRequest = ForgetPasswordRequestSchema.parse(request);
    const response = await ForgetPasswordServerFn({ data: validatedRequest });
    return ForgetPasswordResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const mutationFnResetMe = async (
  request: ResetMeRequest
): Promise<ResetMeResponse> => {
  try {
    const validatedRequest = ResetMeRequestSchema.parse(request);
    const response = await ResetMeServerFn({ data: validatedRequest });
    return ResetMeResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      throw new Error(error.unWrap.message);
    }

    throw error;
  }
};

export const mutationFnDeleteMe = async (
  request: DeleteMeRequest
): Promise<DeleteMeResponse> => {
  try {
    const validatedRequest = DeleteMeRequestSchema.parse(request);
    const response = await DeleteMeServerFn({ data: validatedRequest });
    return DeleteMeResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};
