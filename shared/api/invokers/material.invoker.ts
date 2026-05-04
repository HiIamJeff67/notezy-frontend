import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateNotebookMaterialServerFn,
  CreateTextbookMaterialServerFn,
  DeleteMyMaterialByIdServerFn,
  DeleteMyMaterialsByIdsServerFn,
  GetAllMyMaterialsByRootShelfIdServerFn,
  GetMyMaterialAndItsParentByIdServerFn,
  GetMyMaterialByIdServerFn,
  GetMyMaterialsByParentSubShelfIdServerFn,
  MoveMyMaterialByIdServerFn,
  RestoreMyMaterialByIdServerFn,
  RestoreMyMaterialsByIdsServerFn,
  UpdateMyMaterialByIdServerFn,
} from "@shared/api/functions/material.serverFn";
import {
  type CreateNotebookMaterialRequest,
  CreateNotebookMaterialRequestSchema,
  type CreateNotebookMaterialResponse,
  CreateNotebookMaterialResponseSchema,
  type CreateTextbookMaterialRequest,
  CreateTextbookMaterialRequestSchema,
  type CreateTextbookMaterialResponse,
  CreateTextbookMaterialResponseSchema,
  type DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdRequestSchema,
  type DeleteMyMaterialByIdResponse,
  DeleteMyMaterialByIdResponseSchema,
  type DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsRequestSchema,
  type DeleteMyMaterialsByIdsResponse,
  DeleteMyMaterialsByIdsResponseSchema,
  type GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdRequestSchema,
  type GetAllMyMaterialsByRootShelfIdResponse,
  GetAllMyMaterialsByRootShelfIdResponseSchema,
  type GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdRequestSchema,
  type GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialAndItsParentByIdResponseSchema,
  type GetMyMaterialByIdRequest,
  GetMyMaterialByIdRequestSchema,
  type GetMyMaterialByIdResponse,
  GetMyMaterialByIdResponseSchema,
  type GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdRequestSchema,
  type GetMyMaterialsByParentSubShelfIdResponse,
  GetMyMaterialsByParentSubShelfIdResponseSchema,
  type MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdRequestSchema,
  type MoveMyMaterialByIdResponse,
  MoveMyMaterialByIdResponseSchema,
  type RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdRequestSchema,
  type RestoreMyMaterialByIdResponse,
  RestoreMyMaterialByIdResponseSchema,
  type RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsRequestSchema,
  type RestoreMyMaterialsByIdsResponse,
  RestoreMyMaterialsByIdsResponseSchema,
  type UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdRequestSchema,
  type UpdateMyMaterialByIdResponse,
  UpdateMyMaterialByIdResponseSchema,
} from "@shared/api/interfaces/material.interface";
import { ZodError } from "zod";

export const queryFnGetMyMaterialById = async (
  request: GetMyMaterialByIdRequest
): Promise<GetMyMaterialByIdResponse> => {
  try {
    const validatedRequest = GetMyMaterialByIdRequestSchema.parse(request);
    const response = await GetMyMaterialByIdServerFn({
      data: validatedRequest,
    });
    return GetMyMaterialByIdResponseSchema.parse(response);
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

export const queryFnGetMyMaterialAndItsParentById = async (
  request: GetMyMaterialAndItsParentByIdRequest
): Promise<GetMyMaterialAndItsParentByIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialAndItsParentByIdRequestSchema.parse(request);
    const response = await GetMyMaterialAndItsParentByIdServerFn({
      data: validatedRequest,
    });
    return GetMyMaterialAndItsParentByIdResponseSchema.parse(response);
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

export const queryFnGetMyMaterialsByParentSubShelfId = async (
  request: GetMyMaterialsByParentSubShelfIdRequest
): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyMaterialsByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetMyMaterialsByParentSubShelfIdServerFn({
      data: validatedRequest,
    });
    return GetMyMaterialsByParentSubShelfIdResponseSchema.parse(response);
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

export const queryFnGetAllMyMaterialsByRootShelfId = async (
  request: GetAllMyMaterialsByRootShelfIdRequest
): Promise<GetAllMyMaterialsByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetAllMyMaterialsByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyMaterialsByRootShelfIdServerFn({
      data: validatedRequest,
    });
    return GetAllMyMaterialsByRootShelfIdResponseSchema.parse(response);
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

export const mutationFnCreateTextbookMaterial = async (
  request: CreateTextbookMaterialRequest
): Promise<CreateTextbookMaterialResponse> => {
  try {
    const validatedRequest = CreateTextbookMaterialRequestSchema.parse(request);
    const response = await CreateTextbookMaterialServerFn({
      data: validatedRequest,
    });
    return CreateTextbookMaterialResponseSchema.parse(response);
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
    const response = await CreateNotebookMaterialServerFn({
      data: validatedRequest,
    });
    return CreateNotebookMaterialResponseSchema.parse(response);
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
    const response = await UpdateMyMaterialByIdServerFn({
      data: validatedRequest,
    });
    return UpdateMyMaterialByIdResponseSchema.parse(response);
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
    const response = await MoveMyMaterialByIdServerFn({
      data: validatedRequest,
    });
    return MoveMyMaterialByIdResponseSchema.parse(response);
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
    const response = await RestoreMyMaterialByIdServerFn({
      data: validatedRequest,
    });
    return RestoreMyMaterialByIdResponseSchema.parse(response);
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
    const response = await RestoreMyMaterialsByIdsServerFn({
      data: validatedRequest,
    });
    return RestoreMyMaterialsByIdsResponseSchema.parse(response);
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
    const response = await DeleteMyMaterialByIdServerFn({
      data: validatedRequest,
    });
    return DeleteMyMaterialByIdResponseSchema.parse(response);
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
    const response = await DeleteMyMaterialsByIdsServerFn({
      data: validatedRequest,
    });
    return DeleteMyMaterialsByIdsResponseSchema.parse(response);
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
