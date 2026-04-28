import { NotezyAPIError } from "@shared/api/exceptions";
import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse,
  BatchInsertBlockGroupsByBlockPackIdsRequest,
  BatchInsertBlockGroupsByBlockPackIdsRequestSchema,
  BatchInsertBlockGroupsByBlockPackIdsResponse,
  type BatchMoveMyBlockGroupsByIdsRequest,
  BatchMoveMyBlockGroupsByIdsRequestSchema,
  type BatchMoveMyBlockGroupsByIdsResponse,
  type DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupByIdRequestSchema,
  type DeleteMyBlockGroupByIdResponse,
  type DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsRequestSchema,
  type DeleteMyBlockGroupsByIdsResponse,
  type GetAllMyBlockGroupsByBlockPackIdRequest,
  GetAllMyBlockGroupsByBlockPackIdRequestSchema,
  type GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdRequestSchema,
  type GetMyBlockGroupByIdRequest,
  GetMyBlockGroupByIdRequestSchema,
  type GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  type GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema,
  type GetMyBlockGroupsByPrevBlockGroupIdRequest,
  GetMyBlockGroupsByPrevBlockGroupIdRequestSchema,
  type InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema,
  type InsertBlockGroupAndItsBlocksByBlockPackIdResponse,
  type InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdRequestSchema,
  type InsertBlockGroupByBlockPackIdResponse,
  type InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  type InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertBlockGroupsByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdRequestSchema,
  InsertBlockGroupsByBlockPackIdResponse,
  type InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  type InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  type MoveMyBlockGroupByIdRequest,
  MoveMyBlockGroupByIdRequestSchema,
  type MoveMyBlockGroupByIdResponse,
  type MoveMyBlockGroupsByIdsRequest,
  MoveMyBlockGroupsByIdsRequestSchema,
  type MoveMyBlockGroupsByIdsResponse,
  type RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupByIdRequestSchema,
  type RestoreMyBlockGroupByIdResponse,
  type RestoreMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupsByIdsRequestSchema,
  type RestoreMyBlockGroupsByIdsResponse,
} from "@shared/api/interfaces/blockGroup.interface";
import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIds,
  BatchInsertBlockGroupsByBlockPackIds,
  BatchMoveMyBlockGroupsByIds,
  DeleteMyBlockGroupById,
  DeleteMyBlockGroupsByIds,
  GetAllMyBlockGroupsByBlockPackId,
  GetMyBlockGroupAndItsBlocksById,
  GetMyBlockGroupById,
  GetMyBlockGroupsAndTheirBlocksByBlockPackId,
  GetMyBlockGroupsAndTheirBlocksByIds,
  GetMyBlockGroupsByPrevBlockGroupId,
  InsertBlockGroupAndItsBlocksByBlockPackId,
  InsertBlockGroupByBlockPackId,
  InsertBlockGroupsAndTheirBlocksByBlockPackId,
  InsertBlockGroupsByBlockPackId,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId,
  MoveMyBlockGroupById,
  MoveMyBlockGroupsByIds,
  RestoreMyBlockGroupById,
  RestoreMyBlockGroupsByIds,
} from "@shared/api/invokers/blockGroup.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyBlockGroupById = async (
  request?: GetMyBlockGroupByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyBlockGroupByIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupById(validatedRequest);
    if (!isCallerServerOnly && response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.refreshableTokens?.newCSRFToken) {
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
    if (!isCallerServerOnly && response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.refreshableTokens?.newCSRFToken) {
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
    if (!isCallerServerOnly && response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.refreshableTokens?.newCSRFToken) {
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
    if (!isCallerServerOnly && response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.refreshableTokens?.newCSRFToken) {
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
    if (!isCallerServerOnly && response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.refreshableTokens?.newCSRFToken) {
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
    if (!isCallerServerOnly && response.refreshableTokens?.newAccessToken) {
      LocalStorageManipulator.removeItem(LocalStorageKey.accessToken);
      LocalStorageManipulator.setItem(
        LocalStorageKey.accessToken,
        response.refreshableTokens?.newAccessToken
      );
    }
    if (!isCallerServerOnly && response.refreshableTokens?.newCSRFToken) {
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

export const mutationFnInsertBlockGroupByBlockPackId = async (
  request: InsertBlockGroupByBlockPackIdRequest
): Promise<InsertBlockGroupByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      InsertBlockGroupByBlockPackIdRequestSchema.parse(request);
    const response = await InsertBlockGroupByBlockPackId(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnInsertBlockGroupsByBlockPackId = async (
  request: InsertBlockGroupsByBlockPackIdRequest
): Promise<InsertBlockGroupsByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      InsertBlockGroupsByBlockPackIdRequestSchema.parse(request);
    const response = await InsertBlockGroupsByBlockPackId(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnBatchInsertBlockGroupsByBlockPackIds = async (
  request: BatchInsertBlockGroupsByBlockPackIdsRequest
): Promise<BatchInsertBlockGroupsByBlockPackIdsResponse> => {
  try {
    const validatedRequest =
      BatchInsertBlockGroupsByBlockPackIdsRequestSchema.parse(request);
    const response =
      await BatchInsertBlockGroupsByBlockPackIds(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnInsertBlockGroupAndItsBlocksByBlockPackId = async (
  request: InsertBlockGroupAndItsBlocksByBlockPackIdRequest
): Promise<InsertBlockGroupAndItsBlocksByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema.parse(request);
    const response =
      await InsertBlockGroupAndItsBlocksByBlockPackId(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnInsertBlockGroupsAndTheirBlocksByBlockPackId = async (
  request: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest
): Promise<InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.parse(request);
    const response =
      await InsertBlockGroupsAndTheirBlocksByBlockPackId(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds =
  async (
    request: BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest
  ): Promise<BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse> => {
    try {
      const validatedRequest =
        BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema.parse(
          request
        );
      const response =
        await BatchInsertBlockGroupsAndTheirBlocksByBlockPackIds(
          validatedRequest
        );
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
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
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

export const mutationFnInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId =
  async (
    request: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
    try {
      const validatedRequest =
        InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.parse(
          request
        );
      const response =
        await InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId(
          validatedRequest
        );
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
        const errorMessage = error.issues
          .map(issue => issue.message)
          .join(", ");
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

export const mutationFnMoveMyBlockGroupById = async (
  request: MoveMyBlockGroupByIdRequest
): Promise<MoveMyBlockGroupByIdResponse> => {
  try {
    const validatedRequest = MoveMyBlockGroupsByIdsRequestSchema.parse(request);
    const response = await MoveMyBlockGroupsByIds(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnMoveMyBlockGroupsByIds = async (
  request: MoveMyBlockGroupsByIdsRequest
): Promise<MoveMyBlockGroupsByIdsResponse> => {
  try {
    const validatedRequest = MoveMyBlockGroupByIdRequestSchema.parse(request);
    const response = await MoveMyBlockGroupById(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnBatchMoveMyBlockGroupsByIds = async (
  request: BatchMoveMyBlockGroupsByIdsRequest
): Promise<BatchMoveMyBlockGroupsByIdsResponse> => {
  try {
    const validatedRequest =
      BatchMoveMyBlockGroupsByIdsRequestSchema.parse(request);
    const response = await BatchMoveMyBlockGroupsByIds(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnRestoreMyBlockGroupById = async (
  request: RestoreMyBlockGroupByIdRequest
): Promise<RestoreMyBlockGroupByIdResponse> => {
  try {
    const validatedRequest =
      RestoreMyBlockGroupByIdRequestSchema.parse(request);
    const response = await RestoreMyBlockGroupById(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnRestoreMyBlockGroupsByIds = async (
  request: RestoreMyBlockGroupsByIdsRequest
): Promise<RestoreMyBlockGroupsByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyBlockGroupsByIdsRequestSchema.parse(request);
    const response = await RestoreMyBlockGroupsByIds(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnDeleteMyBlockGroupById = async (
  request: DeleteMyBlockGroupByIdRequest
): Promise<DeleteMyBlockGroupByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockGroupByIdRequestSchema.parse(request);
    const response = await DeleteMyBlockGroupById(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};

export const mutationFnDeleteMyBlockGroupsByIds = async (
  request: DeleteMyBlockGroupsByIdsRequest
): Promise<DeleteMyBlockGroupsByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyBlockGroupsByIdsRequestSchema.parse(request);
    const response = await DeleteMyBlockGroupsByIds(validatedRequest);
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
        default:
          throw new Error(error.unWrap.message);
      }
    }
    throw error;
  }
};
