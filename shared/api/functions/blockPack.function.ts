import { NotezyAPIError } from "@shared/api/exceptions";
import {
  type BatchMoveMyBlockPacksByIdsRequest,
  BatchMoveMyBlockPacksByIdsRequestSchema,
  type BatchMoveMyBlockPacksByIdsResponse,
  type CreateBlockPackRequest,
  CreateBlockPackRequestSchema,
  type CreateBlockPackResponse,
  type CreateBlockPacksRequest,
  CreateBlockPacksRequestSchema,
  type CreateBlockPacksResponse,
  type DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdRequestSchema,
  type DeleteMyBlockPackByIdResponse,
  type DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsRequestSchema,
  type DeleteMyBlockPacksByIdsResponse,
  type GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdRequestSchema,
  type GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdRequestSchema,
  type GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdRequestSchema,
  type GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequestSchema,
  type MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdRequestSchema,
  type MoveMyBlockPackByIdResponse,
  type MoveMyBlockPacksByIdsRequest,
  MoveMyBlockPacksByIdsRequestSchema,
  type MoveMyBlockPacksByIdsResponse,
  type RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdRequestSchema,
  type RestoreMyBlockPackByIdResponse,
  type RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsRequestSchema,
  type RestoreMyBlockPacksByIdsResponse,
  type UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdRequestSchema,
  type UpdateMyBlockPackByIdResponse,
  type UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsRequestSchema,
  type UpdateMyBlockPacksByIdsResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  BatchMoveMyBlockPacksByIds,
  CreateBlockPack,
  CreateBlockPacks,
  DeleteMyBlockPackById,
  DeleteMyBlockPacksByIds,
  GetAllMyBlockPacksByRootShelfId,
  GetMyBlockPackAndItsParentById,
  GetMyBlockPackById,
  GetMyBlockPacksByParentSubShelfId,
  MoveMyBlockPackById,
  MoveMyBlockPacksByIds,
  RestoreMyBlockPackById,
  RestoreMyBlockPacksByIds,
  UpdateMyBlockPackById,
  UpdateMyBlockPacksByIds,
} from "@shared/api/invokers/blockPack.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
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

export const mutationFnCreateBlockPack = async (
  request: CreateBlockPackRequest
): Promise<CreateBlockPackResponse> => {
  try {
    const validatedRequest = CreateBlockPackRequestSchema.parse(request);
    const response = await CreateBlockPack(validatedRequest);
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

export const mutationFnCreateBlockPacks = async (
  request: CreateBlockPacksRequest
): Promise<CreateBlockPacksResponse> => {
  try {
    const validatedRequest = CreateBlockPacksRequestSchema.parse(request);
    const response = await CreateBlockPacks(validatedRequest);
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

export const mutationFnUpdateMyBlockPackById = async (
  request: UpdateMyBlockPackByIdRequest
): Promise<UpdateMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = UpdateMyBlockPackByIdRequestSchema.parse(request);
    const response = await UpdateMyBlockPackById(validatedRequest);
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

export const mutationFnUpdateMyBlockPacksByIds = async (
  request: UpdateMyBlockPacksByIdsRequest
): Promise<UpdateMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await UpdateMyBlockPacksByIds(validatedRequest);
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

export const mutationFnMoveMyBlockPackById = async (
  request: MoveMyBlockPackByIdRequest
): Promise<MoveMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = MoveMyBlockPackByIdRequestSchema.parse(request);
    const response = await MoveMyBlockPackById(validatedRequest);
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

export const mutationFnMoveMyBlockPacksByIds = async (
  request: MoveMyBlockPacksByIdsRequest
): Promise<MoveMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest = MoveMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await MoveMyBlockPacksByIds(validatedRequest);
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

export const mutationFnBatchMoveMyBlockPacksByIds = async (
  request: BatchMoveMyBlockPacksByIdsRequest
): Promise<BatchMoveMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      BatchMoveMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await BatchMoveMyBlockPacksByIds(validatedRequest);
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

export const mutationFnRestoreMyBlockPackById = async (
  request: RestoreMyBlockPackByIdRequest
): Promise<RestoreMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = RestoreMyBlockPackByIdRequestSchema.parse(request);
    const response = await RestoreMyBlockPackById(validatedRequest);
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

export const mutationFnRestoreMyBlockPacksByIds = async (
  request: RestoreMyBlockPacksByIdsRequest
): Promise<RestoreMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await RestoreMyBlockPacksByIds(validatedRequest);
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

export const mutationFnDeleteMyBlockPackById = async (
  request: DeleteMyBlockPackByIdRequest
): Promise<DeleteMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockPackByIdRequestSchema.parse(request);
    const response = await DeleteMyBlockPackById(validatedRequest);
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

export const mutationFnDeleteMyBlockPacksByIds = async (
  request: DeleteMyBlockPacksByIdsRequest
): Promise<DeleteMyBlockPacksByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyBlockPacksByIdsRequestSchema.parse(request);
    const response = await DeleteMyBlockPacksByIds(validatedRequest);
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
