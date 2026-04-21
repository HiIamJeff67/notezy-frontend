import { NotezyAPIError } from "@shared/api/exceptions";
import {
  type BatchMoveMySubShelvesRequest,
  BatchMoveMySubShelvesRequestSchema,
  type BatchMoveMySubShelvesResponse,
  type CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdRequestSchema,
  type CreateSubShelfByRootShelfIdResponse,
  type CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsRequestSchema,
  type CreateSubShelvesByRootShelfIdsResponse,
  type DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdRequestSchema,
  type DeleteMySubShelfByIdResponse,
  type DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsRequestSchema,
  type DeleteMySubShelvesByIdsResponse,
  type GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdRequestSchema,
  type GetMySubShelfByIdRequest,
  GetMySubShelfByIdRequestSchema,
  type GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema,
  type GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequestSchema,
  type MoveMySubShelfRequest,
  MoveMySubShelfRequestSchema,
  type MoveMySubShelfResponse,
  type MoveMySubShelvesRequest,
  MoveMySubShelvesRequestSchema,
  type MoveMySubShelvesResponse,
  type RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdRequestSchema,
  type RestoreMySubShelfByIdResponse,
  type RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsRequestSchema,
  type RestoreMySubShelvesByIdsResponse,
  type UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdRequestSchema,
  type UpdateMySubShelfByIdResponse,
  type UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsRequestSchema,
  type UpdateMySubShelvesByIdsResponse,
} from "@shared/api/interfaces/subShelf.interface";
import {
  BatchMoveMySubShelves,
  CreateSubShelfByRootShelfId,
  CreateSubShelvesByRootShelfIds,
  DeleteMySubShelfById,
  DeleteMySubShelvesByIds,
  GetAllMySubShelvesByRootShelfId,
  GetMySubShelfById,
  GetMySubShelvesAndItemsByPrevSubShelfId,
  GetMySubShelvesByPrevSubShelfId,
  MoveMySubShelf,
  MoveMySubShelves,
  RestoreMySubShelfById,
  RestoreMySubShelvesByIds,
  UpdateMySubShelfById,
  UpdateMySubShelvesByIds,
} from "@shared/api/invokers/subShelf.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMySubShelfById = async (
  request?: GetMySubShelfByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMySubShelfByIdRequestSchema.parse(request);
    const response = await GetMySubShelfById(validatedRequest);
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

export const queryFnGetMySubShelvesByPrevSubShelfId = async (
  request?: GetMySubShelvesByPrevSubShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMySubShelvesByPrevSubShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesByPrevSubShelfId(validatedRequest);
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

export const queryFnGetAllMySubShelvesByRootShelfId = async (
  request?: GetAllMySubShelvesByRootShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetAllMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMySubShelvesByRootShelfId(validatedRequest);
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

export const queryFnGetMySubShelvesAndItemsByPrevSubShelfId = async (
  request?: GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema.parse(request);
    const response =
      await GetMySubShelvesAndItemsByPrevSubShelfId(validatedRequest);
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

export const mutationFnCreateSubShelfByRootShelfId = async (
  request: CreateSubShelfByRootShelfIdRequest
): Promise<CreateSubShelfByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      CreateSubShelfByRootShelfIdRequestSchema.parse(request);
    const response = await CreateSubShelfByRootShelfId(validatedRequest);
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

export const mutationFnCreateSubShelvesByRootShelfIds = async (
  request: CreateSubShelvesByRootShelfIdsRequest
): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
  try {
    const validatedRequest =
      CreateSubShelvesByRootShelfIdsRequestSchema.parse(request);
    const response = await CreateSubShelvesByRootShelfIds(validatedRequest);
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

export const mutationFnUpdateMySubShelfById = async (
  request: UpdateMySubShelfByIdRequest
): Promise<UpdateMySubShelfByIdResponse> => {
  try {
    const validatedRequest = UpdateMySubShelfByIdRequestSchema.parse(request);
    const response = await UpdateMySubShelfById(validatedRequest);
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

export const mutationFnUpdateMySubShelvesByIds = async (
  request: UpdateMySubShelvesByIdsRequest
): Promise<UpdateMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMySubShelvesByIdsRequestSchema.parse(request);
    const response = await UpdateMySubShelvesByIds(validatedRequest);
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

export const mutationFnMoveMySubShelf = async (
  request: MoveMySubShelfRequest
): Promise<MoveMySubShelfResponse> => {
  try {
    const validatedRequest = MoveMySubShelfRequestSchema.parse(request);
    const response = await MoveMySubShelf(validatedRequest);
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

export const mutationFnMoveMySubShelves = async (
  request: MoveMySubShelvesRequest
): Promise<MoveMySubShelvesResponse> => {
  try {
    const validatedRequest = MoveMySubShelvesRequestSchema.parse(request);
    const response = await MoveMySubShelves(validatedRequest);
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

export const mutationFnBatchMoveMySubShelves = async (
  request: BatchMoveMySubShelvesRequest
): Promise<BatchMoveMySubShelvesResponse> => {
  try {
    const validatedRequest = BatchMoveMySubShelvesRequestSchema.parse(request);
    const response = await BatchMoveMySubShelves(validatedRequest);
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

export const mutationFnRestoreMySubShelfById = async (
  request: RestoreMySubShelfByIdRequest
): Promise<RestoreMySubShelfByIdResponse> => {
  try {
    const validatedRequest = RestoreMySubShelfByIdRequestSchema.parse(request);
    const response = await RestoreMySubShelfById(validatedRequest);
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

export const mutationFnRestoreMySubShelvesByIds = async (
  request: RestoreMySubShelvesByIdsRequest
): Promise<RestoreMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMySubShelvesByIdsRequestSchema.parse(request);
    const response = await RestoreMySubShelvesByIds(validatedRequest);
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

export const mutationFnDeleteMySubShelfById = async (
  request: DeleteMySubShelfByIdRequest
): Promise<DeleteMySubShelfByIdResponse> => {
  try {
    const validatedRequest = DeleteMySubShelfByIdRequestSchema.parse(request);
    const response = await DeleteMySubShelfById(validatedRequest);
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

export const mutationFnDeleteMySubShelvesByIds = async (
  request: DeleteMySubShelvesByIdsRequest
): Promise<DeleteMySubShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMySubShelvesByIdsRequestSchema.parse(request);
    const response = await DeleteMySubShelvesByIds(validatedRequest);
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
