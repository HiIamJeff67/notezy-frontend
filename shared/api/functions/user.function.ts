import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import {
  GetMeRequest,
  GetMeRequestSchema,
  GetUserDataRequest,
  GetUserDataRequestSchema,
} from "@shared/api/interfaces/user.interface";
import { GetMe, GetUserData } from "@shared/api/invokers/user.invoker";
import { tKey } from "@shared/translations";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { ZodError } from "zod";

export const queryFnGetUserData = async (
  request?: GetUserDataRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest = GetUserDataRequestSchema.parse(request);
    const response = await GetUserData(validatedRequest);
    if (!isCallerServerOnly && response.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.accessToken,
        response.newAccessToken
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
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
  }
};

export const queryFnGetMe = async (
  request?: GetMeRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest = GetMeRequestSchema.parse(request);
    const response = await GetMe(validatedRequest);
    if (!isCallerServerOnly && response.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.accessToken,
        response.newAccessToken
      );
    }
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    }
    if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};
