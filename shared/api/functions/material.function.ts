import { NotezyAPIError } from "@shared/api/exceptions";
import {
  type CreateNotebookMaterialRequest,
  CreateNotebookMaterialRequestSchema,
  type CreateNotebookMaterialResponse,
  type CreateTextbookMaterialRequest,
  CreateTextbookMaterialRequestSchema,
  type CreateTextbookMaterialResponse,
  type DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  type DeleteMyMaterialByIdResponse,
  type DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  type DeleteMyMaterialsByIdsResponse,
  type GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdRequestSchema,
  type GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdRequestSchema,
  type GetMyMaterialByIdRequest,
  GetMyMaterialByIdRequestSchema,
  type GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdRequestSchema,
  type MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  type MoveMyMaterialByIdResponse,
  type RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  type RestoreMyMaterialByIdResponse,
  type RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  type RestoreMyMaterialsByIdsResponse,
  type SaveMyNotebookMaterialByIdRequest,
  SaveMyNotebookMaterialByIdRequestSchema,
  type SaveMyNotebookMaterialByIdResponse,
  type UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdRequestSchema,
  type UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import {
  CreateNotebookMaterial,
  CreateTextbookMaterial,
  DeleteMyMaterialById,
  DeleteMyMaterialsByIds,
  GetAllMyMaterialsByRootShelfId,
  GetMyMaterialAndItsParentById,
  GetMyMaterialById,
  GetMyMaterialsByParentSubShelfId,
  MoveMyMaterialById,
  RestoreMyMaterialById,
  RestoreMyMaterialsByIds,
  SaveMyNotebookMaterialById,
  UpdateMyMaterialById,
} from "@shared/api/invokers/material.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyMaterialById = async (
  request?: GetMyMaterialByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyMaterialByIdRequestSchema.parse(request);
    const response = await GetMyMaterialById(validatedRequest);
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

export const queryFnGetMyMaterialAndItsParentById = async (
  request?: GetMyMaterialAndItsParentByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyMaterialAndItsParentByIdRequestSchema.parse(request);
    const response = await GetMyMaterialAndItsParentById(validatedRequest);
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

export const queryFnGetMyMaterialsByParentSubShelfId = async (
  request?: GetMyMaterialsByParentSubShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetMyMaterialsByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetMyMaterialsByParentSubShelfId(validatedRequest);
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

export const queryFnGetAllMyMaterialsByRootShelfId = async (
  request?: GetAllMyMaterialsByRootShelfIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest =
      GetAllMyMaterialsByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyMaterialsByRootShelfId(validatedRequest);
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

export const mutationFnCreateTextbookMaterial = async (
  request: CreateTextbookMaterialRequest
): Promise<CreateTextbookMaterialResponse> => {
  try {
    const validatedRequest = CreateTextbookMaterialRequestSchema.parse(request);
    const response = await CreateTextbookMaterial(validatedRequest);
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

export const mutationFnCreateNotebookMaterial = async (
  request: CreateNotebookMaterialRequest
): Promise<CreateNotebookMaterialResponse> => {
  try {
    const validatedRequest = CreateNotebookMaterialRequestSchema.parse(request);
    const response = await CreateNotebookMaterial(validatedRequest);
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

export const mutationFnUpdateMyMaterialById = async (
  request: UpdateMyMaterialByIdRequest
): Promise<UpdateMyMaterialByIdResponse> => {
  try {
    const validatedRequest = UpdateMyMaterialByIdRequestSchema.parse(request);
    const response = await UpdateMyMaterialById(validatedRequest);
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

export const mutationFnSaveMyNotebookMaterialById = async (
  request: SaveMyNotebookMaterialByIdRequest
): Promise<SaveMyNotebookMaterialByIdResponse> => {
  try {
    const validatedRequest =
      SaveMyNotebookMaterialByIdRequestSchema.parse(request);
    const response = await SaveMyNotebookMaterialById(validatedRequest);
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

export const mutationFnMoveMyMaterialById = async (
  request: MoveMyMaterialByIdRequest
): Promise<MoveMyMaterialByIdResponse> => {
  try {
    const validatedRequest = MoveMyMaterialByIdRequestSchema.parse(request);
    const response = await MoveMyMaterialById(validatedRequest);
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

export const mutationFnRestoreMyMaterialById = async (
  request: RestoreMyMaterialByIdRequest
): Promise<RestoreMyMaterialByIdResponse> => {
  try {
    const validatedRequest = RestoreMyMaterialByIdRequestSchema.parse(request);
    const response = await RestoreMyMaterialById(validatedRequest);
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

export const mutationFnRestoreMyMaterialsByIds = async (
  request: RestoreMyMaterialsByIdsRequest
): Promise<RestoreMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyMaterialsByIdsRequestSchema.parse(request);
    const response = await RestoreMyMaterialsByIds(validatedRequest);
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

export const mutationFnDeleteMyMaterialById = async (
  request: DeleteMyMaterialByIdRequest
): Promise<DeleteMyMaterialByIdResponse> => {
  try {
    const validatedRequest = DeleteMyMaterialByIdRequestSchema.parse(request);
    const response = await DeleteMyMaterialById(validatedRequest);
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

export const mutationFnDeleteMyMaterialsByIds = async (
  request: DeleteMyMaterialsByIdsRequest
): Promise<DeleteMyMaterialsByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyMaterialsByIdsRequestSchema.parse(request);
    const response = await DeleteMyMaterialsByIds(validatedRequest);
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
