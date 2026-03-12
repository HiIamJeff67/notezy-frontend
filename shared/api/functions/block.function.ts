import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetAllMyBlocksRequest,
  GetAllMyBlocksRequestSchema,
  GetMyBlockByIdRequest,
  GetMyBlockByIdRequestSchema,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdRequestSchema,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockGroupIdsRequestSchema,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdRequestSchema,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsRequestSchema,
} from "@shared/api/interfaces/block.interface";
import {
  GetAllMyBlocks,
  GetMyBlockById,
  GetMyBlocksByBlockGroupId,
  GetMyBlocksByBlockGroupIds,
  GetMyBlocksByBlockPackId,
  GetMyBlocksByIds,
} from "@shared/api/invokers/block.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyBlockById = async (
  request?: GetMyBlockByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyBlockByIdRequestSchema.parse(request);
    const response = await GetMyBlockById(validatedRequest);
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

export const queryFnGetMyBlocksByIds = async (
  request?: GetMyBlocksByIdsRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyBlocksByIdsRequestSchema.parse(request);
    const response = await GetMyBlocksByIds(validatedRequest);
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

export const queryFnGetMyBlocksByBlockGroupId = async (
  request?: GetMyBlocksByBlockGroupIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlocksByBlockGroupIdRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockGroupId(validatedRequest);
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

export const queryFnGetMyBlocksByBlockGroupIds = async (
  request?: GetMyBlocksByBlockGroupIdsRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlocksByBlockGroupIdsRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockGroupIds(validatedRequest);
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

export const queryFnGetMyBlocksByBlockPackId = async (
  request?: GetMyBlocksByBlockPackIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyBlocksByBlockPackIdRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockPackId(validatedRequest);
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

export const queryFnGetAllMyBlocks = async (
  request?: GetAllMyBlocksRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetAllMyBlocksRequestSchema.parse(request);
    const response = await GetAllMyBlocks(validatedRequest);
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
