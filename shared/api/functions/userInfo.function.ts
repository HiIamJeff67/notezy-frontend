import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetMyInfoRequest,
  GetMyInfoRequestSchema,
} from "@shared/api/interfaces/userInfo.interface";
import { GetMyInfo } from "@shared/api/invokers/userInfo.invoker";

import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyInfo = async (
  request?: GetMyInfoRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest = GetMyInfoRequestSchema.parse(request);
    const response = await GetMyInfo(validatedRequest);
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
