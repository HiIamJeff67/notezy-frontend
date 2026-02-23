import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetAllMyBlockGroupsByBlockPackIdRequestSchema,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdRequestSchema,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupByIdRequestSchema,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
  GetMyBlockGroupsByPrevBlockGroupIdRequestSchema,
} from "@shared/api/interfaces/blockGroup.interface";
import {
  GetAllMyBlockGroupsByBlockPackId,
  GetMyBlockGroupAndItsBlocksById,
  GetMyBlockGroupById,
  GetMyBlockGroupsAndTheirBlocksByBlockPackId,
  GetMyBlockGroupsAndTheirBlocksByIds,
  GetMyBlockGroupsByPrevBlockGroupId,
} from "@shared/api/invokers/blockGroup.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKeys } from "@shared/types/localStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyBlockGroupById = async (
  request?: GetMyBlockGroupByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyBlockGroupByIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupById(validatedRequest);
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

export const queryFnGetMyBlockGroupAndItsBlocksById = async (
  request?: GetMyBlockGroupAndItsBlocksByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlockGroupAndItsBlocksByIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupAndItsBlocksById(validatedRequest);
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

export const queryFnGetMyBlockGroupsAndTheirBlocksByIds = async (
  request?: GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema.parse(request);
    const response =
      await GetMyBlockGroupsAndTheirBlocksByIds(validatedRequest);
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

export const queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId = async (
  request?: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.parse(request);
    const response =
      await GetMyBlockGroupsAndTheirBlocksByBlockPackId(validatedRequest);
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

export const queryFnGetMyBlockGroupsByPrevBlockGroupId = async (
  request?: GetMyBlockGroupsByPrevBlockGroupIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlockGroupsByPrevBlockGroupIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupsByPrevBlockGroupId(validatedRequest);
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

export const queryFnGetAllMyBlockGroupsByBlockPackId = async (
  request?: GetAllMyBlockGroupsByBlockPackIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetAllMyBlockGroupsByBlockPackIdRequestSchema.parse(request);
    const response = await GetAllMyBlockGroupsByBlockPackId(validatedRequest);
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
