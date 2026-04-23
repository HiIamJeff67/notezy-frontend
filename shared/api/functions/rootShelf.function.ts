import { NotezyAPIError } from "@shared/api/exceptions";
import {
  type CreateRootShelfRequest,
  CreateRootShelfRequestSchema,
  type CreateRootShelfResponse,
  type CreateRootShelvesRequest,
  CreateRootShelvesRequestSchema,
  type CreateRootShelvesResponse,
  type DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdRequestSchema,
  type DeleteMyRootShelfByIdResponse,
  type DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  type DeleteMyRootShelvesByIdsResponse,
  type GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdRequestSchema,
  type RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequestSchema,
  type RestoreMyRootShelfByIdResponse,
  type RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  type RestoreMyRootShelvesByIdsResponse,
  type UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdRequestSchema,
  type UpdateMyRootShelfByIdResponse,
  type UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsRequestSchema,
  type UpdateMyRootShelvesByIdsResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import {
  CreateRootShelf,
  CreateRootShelves,
  DeleteMyRootShelfById,
  DeleteMyRootShelvesByIds,
  GetMyRootShelfById,
  RestoreMyRootShelfById,
  RestoreMyRootShelvesByIds,
  UpdateMyRootShelfById,
  UpdateMyRootShelvesByIds,
} from "@shared/api/invokers/rootShelf.invoker";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { ZodError } from "zod";

export const queryFnGetMyRootShelfById = async (
  request?: GetMyRootShelfByIdRequest,
  isCallerServerOnly: boolean = false
) => {
  if (!request) throw new Error("got undefined request in query function");

  try {
    const validatedRequest = GetMyRootShelfByIdRequestSchema.parse(request);
    const response = await GetMyRootShelfById(validatedRequest);
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

export const mutationFnCreateRootShelf = async (
  request: CreateRootShelfRequest
): Promise<CreateRootShelfResponse> => {
  try {
    const validatedRequest = CreateRootShelfRequestSchema.parse(request);
    const response = await CreateRootShelf(validatedRequest);
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

export const mutationFnCreateRootShelves = async (
  request: CreateRootShelvesRequest
): Promise<CreateRootShelvesResponse> => {
  try {
    const validatedRequest = CreateRootShelvesRequestSchema.parse(request);
    const response = await CreateRootShelves(validatedRequest);
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

export const mutationFnUpdateMyRootShelfById = async (
  request: UpdateMyRootShelfByIdRequest
): Promise<UpdateMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = UpdateMyRootShelfByIdRequestSchema.parse(request);
    const response = await UpdateMyRootShelfById(validatedRequest);
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

export const mutationFnUpdateMyRootShelvesByIds = async (
  request: UpdateMyRootShelvesByIdsRequest
): Promise<UpdateMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      UpdateMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await UpdateMyRootShelvesByIds(validatedRequest);
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

export const mutationFnRestoreMyRootShelfById = async (
  request: RestoreMyRootShelfByIdRequest
): Promise<RestoreMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = RestoreMyRootShelfByIdRequestSchema.parse(request);
    const response = await RestoreMyRootShelfById(validatedRequest);
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

export const mutationFnRestoreMyRootShelvesByIds = async (
  request: RestoreMyRootShelvesByIdsRequest
): Promise<RestoreMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      RestoreMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await RestoreMyRootShelvesByIds(validatedRequest);
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

export const mutationFnDeleteMyRootShelfById = async (
  request: DeleteMyRootShelfByIdRequest
): Promise<DeleteMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = DeleteMyRootShelfByIdRequestSchema.parse(request);
    const response = await DeleteMyRootShelfById(validatedRequest);
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

export const mutationFnDeleteMyRootShelvesByIds = async (
  request: DeleteMyRootShelvesByIdsRequest
): Promise<DeleteMyRootShelvesByIdsResponse> => {
  try {
    const validatedRequest =
      DeleteMyRootShelvesByIdsRequestSchema.parse(request);
    const response = await DeleteMyRootShelvesByIds(validatedRequest);
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
