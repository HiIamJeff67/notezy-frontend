import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdRequestSchema,
} from "@shared/api/interfaces/rootShelf.interface";
import { GetMyRootShelfById } from "@shared/api/invokers/rootShelf.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { SessionStorageKeys } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyRootShelfById = async (
  request?: GetMyRootShelfByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyRootShelfByIdRequestSchema.parse(request);
    const response = await GetMyRootShelfById(validatedRequest);
    if (!isCallerServerOnly && response.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKeys.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKeys.accessToken,
        response.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.newCSRFToken) {
      SessionStorageManipulator.removeItem(SessionStorageKeys.csrfToken);
      SessionStorageManipulator.setItem(
        SessionStorageKeys.csrfToken,
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
