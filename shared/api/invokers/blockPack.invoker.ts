import { NotezyAPIError } from "@shared/api/exceptions";
import {
  BatchMoveMyBlockPacksByIdsServerFn,
  CreateBlockPackServerFn,
  CreateBlockPacksServerFn,
  DeleteMyBlockPackByIdServerFn,
  DeleteMyBlockPacksByIdsServerFn,
  GetAllMyBlockPacksByRootShelfIdServerFn,
  GetMyBlockPackAndItsParentByIdServerFn,
  GetMyBlockPackByIdServerFn,
  GetMyBlockPacksByParentSubShelfIdServerFn,
  MoveMyBlockPackByIdServerFn,
  MoveMyBlockPacksByIdsServerFn,
  RestoreMyBlockPackByIdServerFn,
  RestoreMyBlockPacksByIdsServerFn,
  UpdateMyBlockPackByIdServerFn,
  UpdateMyBlockPacksByIdsServerFn,
} from "@shared/api/functions/blockPack.serverFn";
import {
  type BatchMoveMyBlockPacksByIdsRequest,
  BatchMoveMyBlockPacksByIdsRequestSchema,
  type BatchMoveMyBlockPacksByIdsResponse,
  BatchMoveMyBlockPacksByIdsResponseSchema,
  type CreateBlockPackRequest,
  CreateBlockPackRequestSchema,
  type CreateBlockPackResponse,
  CreateBlockPackResponseSchema,
  type CreateBlockPacksRequest,
  CreateBlockPacksRequestSchema,
  type CreateBlockPacksResponse,
  CreateBlockPacksResponseSchema,
  type DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdRequestSchema,
  type DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPackByIdResponseSchema,
  type DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsRequestSchema,
  type DeleteMyBlockPacksByIdsResponse,
  DeleteMyBlockPacksByIdsResponseSchema,
  type GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdRequestSchema,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetAllMyBlockPacksByRootShelfIdResponseSchema,
  type GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdRequestSchema,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackAndItsParentByIdResponseSchema,
  type GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdRequestSchema,
  GetMyBlockPackByIdResponse,
  GetMyBlockPackByIdResponseSchema,
  type GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdRequestSchema,
  GetMyBlockPacksByParentSubShelfIdResponse,
  GetMyBlockPacksByParentSubShelfIdResponseSchema,
  type MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdRequestSchema,
  type MoveMyBlockPackByIdResponse,
  MoveMyBlockPackByIdResponseSchema,
  type MoveMyBlockPacksByIdsRequest,
  MoveMyBlockPacksByIdsRequestSchema,
  type MoveMyBlockPacksByIdsResponse,
  MoveMyBlockPacksByIdsResponseSchema,
  type RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdRequestSchema,
  type RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPackByIdResponseSchema,
  type RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsRequestSchema,
  type RestoreMyBlockPacksByIdsResponse,
  RestoreMyBlockPacksByIdsResponseSchema,
  type UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdRequestSchema,
  type UpdateMyBlockPackByIdResponse,
  UpdateMyBlockPackByIdResponseSchema,
  type UpdateMyBlockPacksByIdsRequest,
  UpdateMyBlockPacksByIdsRequestSchema,
  type UpdateMyBlockPacksByIdsResponse,
  UpdateMyBlockPacksByIdsResponseSchema,
} from "@shared/api/interfaces/blockPack.interface";
import { ZodError } from "zod";

export const queryFnGetMyBlockPackById = async (
  request: GetMyBlockPackByIdRequest
): Promise<GetMyBlockPackByIdResponse> => {
  try {
    const validatedRequest = GetMyBlockPackByIdRequestSchema.parse(request);
    const response = await GetMyBlockPackByIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockPackByIdResponseSchema.parse(response);
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

export const queryFnGetMyBlockPackAndItsParentById = async (
  request: GetMyBlockPackAndItsParentByIdRequest
): Promise<GetMyBlockPackAndItsParentByIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockPackAndItsParentByIdRequestSchema.parse(request);
    const response = await GetMyBlockPackAndItsParentByIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockPackAndItsParentByIdResponseSchema.parse(response);
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

export const queryFnGetMyBlockPacksByParentSubShelfId = async (
  request: GetMyBlockPacksByParentSubShelfIdRequest
): Promise<GetMyBlockPacksByParentSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockPacksByParentSubShelfIdRequestSchema.parse(request);
    const response = await GetMyBlockPacksByParentSubShelfIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockPacksByParentSubShelfIdResponseSchema.parse(response);
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

export const queryFnGetAllMyBlockPacksByRootShelfId = async (
  request: GetAllMyBlockPacksByRootShelfIdRequest
): Promise<GetAllMyBlockPacksByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetAllMyBlockPacksByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMyBlockPacksByRootShelfIdServerFn({
      data: validatedRequest,
    });
    return GetAllMyBlockPacksByRootShelfIdResponseSchema.parse(response);
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

export const mutationFnCreateBlockPack = async (
  request: CreateBlockPackRequest
): Promise<CreateBlockPackResponse> => {
  try {
    const validatedRequest = CreateBlockPackRequestSchema.parse(request);
    const response = await CreateBlockPackServerFn({ data: validatedRequest });
    return CreateBlockPackResponseSchema.parse(response);
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
    const response = await CreateBlockPacksServerFn({ data: validatedRequest });
    return CreateBlockPacksResponseSchema.parse(response);
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
    const response = await UpdateMyBlockPackByIdServerFn({
      data: validatedRequest,
    });
    return UpdateMyBlockPackByIdResponseSchema.parse(response);
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
    const response = await UpdateMyBlockPacksByIdsServerFn({
      data: validatedRequest,
    });
    return UpdateMyBlockPacksByIdsResponseSchema.parse(response);
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
    const response = await MoveMyBlockPackByIdServerFn({
      data: validatedRequest,
    });
    return MoveMyBlockPackByIdResponseSchema.parse(response);
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
    const response = await MoveMyBlockPacksByIdsServerFn({
      data: validatedRequest,
    });
    return MoveMyBlockPacksByIdsResponseSchema.parse(response);
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
    const response = await BatchMoveMyBlockPacksByIdsServerFn({
      data: validatedRequest,
    });
    return BatchMoveMyBlockPacksByIdsResponseSchema.parse(response);
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
    const response = await RestoreMyBlockPackByIdServerFn({
      data: validatedRequest,
    });
    return RestoreMyBlockPackByIdResponseSchema.parse(response);
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
    const response = await RestoreMyBlockPacksByIdsServerFn({
      data: validatedRequest,
    });
    return RestoreMyBlockPacksByIdsResponseSchema.parse(response);
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
    const response = await DeleteMyBlockPackByIdServerFn({
      data: validatedRequest,
    });
    return DeleteMyBlockPackByIdResponseSchema.parse(response);
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
    const response = await DeleteMyBlockPacksByIdsServerFn({
      data: validatedRequest,
    });
    return DeleteMyBlockPacksByIdsResponseSchema.parse(response);
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
