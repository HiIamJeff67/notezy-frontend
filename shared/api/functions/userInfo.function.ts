import { NotezyAPIError } from "@shared/api/exceptions";
import {
  type GetMyInfoRequest,
  GetMyInfoRequestSchema,
  type UpdateMyInfoRequest,
  UpdateMyInfoRequestSchema,
  type UpdateMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { GetMyInfo, UpdateMyInfo } from "@shared/api/invokers/userInfo.invoker";

import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyInfo = async (
  request?: GetMyInfoRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyInfoRequestSchema.parse(request);
    const response = await GetMyInfo(validatedRequest);
    if (!isCallerServerOnly && response.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKey.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKey.csrfToken,
        response.newCSRFToken
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

export const mutationFnUpdateMyInfo = async (
  request: UpdateMyInfoRequest
): Promise<UpdateMyInfoResponse> => {
  try {
    const validatedRequest = UpdateMyInfoRequestSchema.parse(request);
    const response = await UpdateMyInfo(validatedRequest);
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
    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};
