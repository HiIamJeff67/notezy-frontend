import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdRequestSchema,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdRequestSchema,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequestSchema,
} from "@shared/api/interfaces/subShelf.interface";
import {
  GetAllMySubShelvesByRootShelfId,
  GetMySubShelfById,
  GetMySubShelvesByPrevSubShelfId,
} from "@shared/api/invokers/subShelf.invoker";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { ZodError } from "zod";

export const queryFnGetMySubShelfById = async (
  request?: GetMySubShelfByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest = GetMySubShelfByIdRequestSchema.parse(request);
    const response = await GetMySubShelfById(validatedRequest);
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

export const queryFnGetMySubShelvesByPrevSubShelfId = async (
  request?: GetMySubShelvesByPrevSubShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest =
      GetMySubShelvesByPrevSubShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesByPrevSubShelfId(validatedRequest);
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

export const queryFnGetAllMySubShelvesByRootShelfId = async (
  request?: GetAllMySubShelvesByRootShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest =
      GetAllMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMySubShelvesByRootShelfId(validatedRequest);
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
