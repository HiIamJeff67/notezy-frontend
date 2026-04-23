import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { LocalDatabaseExceptions } from "@shared/api/exceptions/localDatabase.exception";
import {
  type DeleteMeRequest,
  DeleteMeRequestSchema,
  type DeleteMeResponse,
  type ForgetPasswordRequest,
  ForgetPasswordRequestSchema,
  type ForgetPasswordResponse,
  type LoginRequest,
  LoginRequestSchema,
  type LoginResponse,
  type LoginViaGoogleRequest,
  LoginViaGoogleRequestSchema,
  type LoginViaGoogleResponse,
  type LogoutRequest,
  LogoutRequestSchema,
  type LogoutResponse,
  type RegisterRequest,
  RegisterRequestSchema,
  type RegisterResponse,
  type RegisterViaGoogleRequest,
  RegisterViaGoogleRequestSchema,
  type RegisterViaGoogleResponse,
  type ResetEmailRequest,
  ResetEmailRequestSchema,
  type ResetEmailResponse,
  type ResetMeRequest,
  ResetMeRequestSchema,
  type ResetMeResponse,
  type SendAuthCodeRequest,
  SendAuthCodeRequestSchema,
  type SendAuthCodeResponse,
  type ValidateEmailRequest,
  ValidateEmailRequestSchema,
  type ValidateEmailResponse,
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
// import { localdb } from "@shared/api/local/db";
import { userAccount, userData, userInfo } from "@shared/api/local/schemas";
import { user } from "@shared/api/local/schemas/user.schema";
import { userSetting } from "@shared/api/local/schemas/userSetting.schema";
import { UserStatus } from "@shared/enums";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { tKey } from "@shared/translations";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

export const mutationFnRegister = async (
  request: RegisterRequest
): Promise<RegisterResponse> => {
  try {
    const validatedRequest = RegisterRequestSchema.parse(request);
    const response = await Register(validatedRequest);
    // try {
    //   await localdb.insert(user).values({
    //     publicId: response.data.publicId,
    //     name: request.body.name,
    //     displayName: response.data.displayName,
    //     email: request.body.email,
    //     updatedAt: response.data.createdAt,
    //     createdAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userInfo).values({
    //     publicId: response.data.publicId,
    //     updatedAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userAccount).values({
    //     publicId: response.data.publicId,
    //     updatedAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userSetting).values({
    //     publicId: response.data.publicId,
    //     updatedAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userData).values({
    //     publicId: response.data.publicId,
    //     name: request.body.name,
    //     displayName: response.data.displayName,
    //     email: request.body.email,
    //     updatedAt: response.data.createdAt,
    //     createdAt: response.data.createdAt,
    //   });
    // } catch (error) {
    //   throw LocalDatabaseExceptions.FailedInMutationFunction("Register");
    // }
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
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await RegisterViaGoogle(validatedRequest);
    // try {
    //   await localdb.insert(user).values({
    //     publicId: response.data.publicId,
    //     name: response.data.name,
    //     displayName: response.data.displayName,
    //     email: response.data.email,
    //     updatedAt: response.data.createdAt,
    //     createdAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userInfo).values({
    //     publicId: response.data.publicId,
    //     updatedAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userAccount).values({
    //     publicId: response.data.publicId,
    //     updatedAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userSetting).values({
    //     publicId: response.data.publicId,
    //     updatedAt: response.data.createdAt,
    //   });
    //   await localdb.insert(userData).values({
    //     publicId: response.data.publicId,
    //     name: response.data.name,
    //     displayName: response.data.displayName,
    //     email: response.data.email,
    //     updatedAt: response.data.createdAt,
    //     createdAt: response.data.createdAt,
    //   });
    // } catch (error) {
    //   throw LocalDatabaseExceptions.FailedInMutationFunction(
    //     "Register Via Google"
    //   );
    // }
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
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await Login(validatedRequest);
    // try {
    //   const existingUser = await localdb.query.user.findFirst({
    //     where: eq(user.publicId, response.data.publicId),
    //   });
    //   if (!existingUser) {
    //     await localdb.insert(user).values({
    //       publicId: response.data.publicId,
    //       name: response.data.name,
    //       displayName: response.data.displayName,
    //       email: response.data.email,
    //       updatedAt: response.data.updatedAt,
    //       createdAt: response.data.updatedAt,
    //     });
    //     await localdb.insert(userInfo).values({
    //       publicId: response.data.publicId,
    //       updatedAt: response.data.createdAt,
    //     });
    //     await localdb.insert(userAccount).values({
    //       publicId: response.data.publicId,
    //       updatedAt: response.data.createdAt,
    //     });
    //     await localdb.insert(userSetting).values({
    //       publicId: response.data.publicId,
    //       updatedAt: response.data.createdAt,
    //     });
    //     await localdb.insert(userData).values({
    //       publicId: response.data.publicId,
    //       name: response.data.name,
    //       displayName: response.data.displayName,
    //       email: response.data.email,
    //       updatedAt: response.data.createdAt,
    //       createdAt: response.data.createdAt,
    //     });
    //   }
    // } catch (error) {
    //   throw LocalDatabaseExceptions.FailedInMutationFunction("Login");
    // }
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
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await LoginViaGoogle(validatedRequest);
    // try {
    //   const existingUser = await localdb.query.user.findFirst({
    //     where: eq(user.publicId, response.data.publicId),
    //   });
    //   if (!existingUser) {
    //     await localdb.insert(user).values({
    //       publicId: response.data.publicId,
    //       name: response.data.name,
    //       displayName: response.data.displayName,
    //       email: response.data.email,
    //       updatedAt: response.data.updatedAt,
    //       createdAt: response.data.updatedAt,
    //     });
    //     await localdb.insert(userInfo).values({
    //       publicId: response.data.publicId,
    //       updatedAt: response.data.createdAt,
    //     });
    //     await localdb.insert(userAccount).values({
    //       publicId: response.data.publicId,
    //       updatedAt: response.data.createdAt,
    //     });
    //     await localdb.insert(userSetting).values({
    //       publicId: response.data.publicId,
    //       updatedAt: response.data.createdAt,
    //     });
    //     await localdb.insert(userData).values({
    //       publicId: response.data.publicId,
    //       name: response.data.name,
    //       displayName: response.data.displayName,
    //       email: response.data.email,
    //       updatedAt: response.data.createdAt,
    //       createdAt: response.data.createdAt,
    //     });
    //   }
    // } catch (error) {
    //   throw LocalDatabaseExceptions.FailedInMutationFunction(
    //     "Login Via Google"
    //   );
    // }
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
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await Logout(validatedRequest);
    // try {
    //   await localdb.update(user).set({
    //     status: UserStatus.Offline,
    //   });
    // } catch (error) {
    //   throw LocalDatabaseExceptions.FailedInMutationFunction("Logout");
    // }
    LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
    SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnSendAuthCode = async (
  request: SendAuthCodeRequest
): Promise<SendAuthCodeResponse> => {
  try {
    const validatedRequest = SendAuthCodeRequestSchema.parse(request);
    const response = await SendAuthCode(validatedRequest);
    if (response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (response.refreshableTokens?.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
    }
    return response;
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
    const response = await ValidateEmail(validatedRequest);
    // try {
    //   // const existingUser = await localdb.query.user.findFirst({where: eq()})
    // } catch (error) {
    //   throw LocalDatabaseExceptions.FailedInMutationFunction("Validate Email");
    // }
    if (response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (response.refreshableTokens?.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await ResetEmail(validatedRequest);
    if (response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (response.refreshableTokens?.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await ForgetPassword(validatedRequest);
    if (response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (response.refreshableTokens?.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
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
    const response = await ResetMe(validatedRequest);
    if (response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (response.refreshableTokens?.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.refreshableTokens?.newCSRFToken
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnDeleteMe = async (
  request: DeleteMeRequest
): Promise<DeleteMeResponse> => {
  try {
    const validatedRequest = DeleteMeRequestSchema.parse(request);
    const response = await DeleteMe(validatedRequest);
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.localDatabase.failedInMutationFunction:
          throw new Error(tKey.error.localDatabaseError);
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};
