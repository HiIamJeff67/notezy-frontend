import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdRequestSchema,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdRequestSchema,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdRequestSchema,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequestSchema,
} from "@shared/api/interfaces/blockPack.interface";
import {
  GetAllMyBlockPacksByRootShelfId,
  GetMyBlockPackAndItsParentById,
  GetMyBlockPackById,
  GetMyBlockPacksByParentSubShelfId,
} from "@shared/api/invokers/blockPack.invoker";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyBlockPackById = async (
  request?: GetMyBlockPackByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyBlockPackByIdRequestSchema.parse(request);
    const response = await GetMyBlockPackById(validatedRequest);
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

export const queryFnGetMyBlockPackAndItsParentById = async (
  request?: GetMyBlockPackAndItsParentByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlockPackAndItsParentByIdRequestSchema.parse(request);
    const response = await GetMyBlockPackAndItsParentById(validatedRequest);
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

export const queryFnGetMyBlockPacksByParentSubShelfId = async (
  request?: GetMyBlockPacksByParentSubShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlockPacksByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetMyBlockPacksByParentSubShelfId(validatedRequest);
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

export const queryFnGetAllMyBlockPacksByRootShelfId = async (
  request?: GetAllMyBlockPacksByRootShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetAllMyBlockPacksByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyBlockPacksByRootShelfId(validatedRequest);
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
