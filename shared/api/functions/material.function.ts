import { LocalStorageManipulator } from "@/util/localStorageManipulator";
import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetAllMyMaterialsByParentSubShelfIdRequest,
  GetAllMyMaterialsByParentSubShelfIdRequestSchema,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdRequestSchema,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdRequestSchema,
} from "@shared/api/interfaces/material.interface";
import {
  GetAllMyMaterialsByParentSubShelfId,
  GetAllMyMaterialsByRootShelfId,
  GetMyMaterialById,
} from "@shared/api/invokers/material.invoker";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyMaterialById = async (
  request?: GetMyMaterialByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest = GetMyMaterialByIdRequestSchema.parse(request);
    const response = await GetMyMaterialById(validatedRequest);
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

export const queryFnGetAllMyMaterialsByParentSubShelfId = async (
  request?: GetAllMyMaterialsByParentSubShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest =
      GetAllMyMaterialsByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetAllMyMaterialsByParentSubShelfId(
      validatedRequest
    );
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

export const queryFnGetAllMyMaterialsByRootShelfId = async (
  request?: GetAllMyMaterialsByRootShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) return;

  try {
    const validatedRequest =
      GetAllMyMaterialsByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyMaterialsByRootShelfId(validatedRequest);
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
