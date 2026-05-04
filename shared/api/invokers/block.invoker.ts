import { NotezyAPIError } from "@shared/api/exceptions";
import {
  DeleteMyBlockByIdServerFn,
  DeleteMyBlocksByIdsServerFn,
  GetAllMyBlocksServerFn,
  GetMyBlockByIdServerFn,
  GetMyBlocksByBlockGroupIdServerFn,
  GetMyBlocksByBlockGroupIdsServerFn,
  GetMyBlocksByBlockPackIdServerFn,
  GetMyBlocksByIdsServerFn,
  InsertBlockServerFn,
  InsertBlocksServerFn,
  RestoreMyBlockByIdServerFn,
  RestoreMyBlocksByIdsServerFn,
  UpdateMyBlockByIdServerFn,
  UpdateMyBlocksByIdsServerFn,
} from "@shared/api/functions/block.serverFn";
import {
  type DeleteMyBlockByIdRequest,
  DeleteMyBlockByIdRequestSchema,
  type DeleteMyBlockByIdResponse,
  DeleteMyBlockByIdResponseSchema,
  type DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsRequestSchema,
  type DeleteMyBlocksByIdsResponse,
  DeleteMyBlocksByIdsResponseSchema,
  type GetAllMyBlocksRequest,
  GetAllMyBlocksRequestSchema,
  GetAllMyBlocksResponse,
  GetAllMyBlocksResponseSchema,
  type GetMyBlockByIdRequest,
  GetMyBlockByIdRequestSchema,
  GetMyBlockByIdResponse,
  GetMyBlockByIdResponseSchema,
  type GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdRequestSchema,
  GetMyBlocksByBlockGroupIdResponse,
  GetMyBlocksByBlockGroupIdResponseSchema,
  type GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockGroupIdsRequestSchema,
  GetMyBlocksByBlockGroupIdsResponse,
  GetMyBlocksByBlockGroupIdsResponseSchema,
  type GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdRequestSchema,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByBlockPackIdResponseSchema,
  type GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsRequestSchema,
  GetMyBlocksByIdsResponse,
  GetMyBlocksByIdsResponseSchema,
  type InsertBlockRequest,
  InsertBlockRequestSchema,
  type InsertBlockResponse,
  InsertBlockResponseSchema,
  type InsertBlocksRequest,
  InsertBlocksRequestSchema,
  type InsertBlocksResponse,
  InsertBlocksResponseSchema,
  type RestoreMyBlockByIdRequest,
  RestoreMyBlockByIdRequestSchema,
  type RestoreMyBlockByIdResponse,
  RestoreMyBlockByIdResponseSchema,
  type RestoreMyBlocksByIdsRequest,
  RestoreMyBlocksByIdsRequestSchema,
  type RestoreMyBlocksByIdsResponse,
  RestoreMyBlocksByIdsResponseSchema,
  type UpdateMyBlockByIdRequest,
  UpdateMyBlockByIdRequestSchema,
  type UpdateMyBlockByIdResponse,
  UpdateMyBlockByIdResponseSchema,
  type UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsRequestSchema,
  type UpdateMyBlocksByIdsResponse,
  UpdateMyBlocksByIdsResponseSchema,
} from "@shared/api/interfaces/block.interface";
import { ZodError } from "zod";

export const queryFnGetMyBlockById = async (
  request: GetMyBlockByIdRequest
): Promise<GetMyBlockByIdResponse> => {
  try {
    const validatedRequest = GetMyBlockByIdRequestSchema.parse(request);
    const response = await GetMyBlockByIdServerFn({ data: validatedRequest });
    return GetMyBlockByIdResponseSchema.parse(response);
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

export const queryFnGetMyBlocksByIds = async (
  request: GetMyBlocksByIdsRequest
): Promise<GetMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = GetMyBlocksByIdsRequestSchema.parse(request);
    const response = await GetMyBlocksByIdsServerFn({ data: validatedRequest });
    return GetMyBlocksByIdsResponseSchema.parse(response);
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

export const queryFnGetMyBlocksByBlockGroupId = async (
  request: GetMyBlocksByBlockGroupIdRequest
): Promise<GetMyBlocksByBlockGroupIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlocksByBlockGroupIdRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockGroupIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlocksByBlockGroupIdResponseSchema.parse(response);
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

export const queryFnGetMyBlocksByBlockGroupIds = async (
  request: GetMyBlocksByBlockGroupIdsRequest
): Promise<GetMyBlocksByBlockGroupIdsResponse> => {
  try {
    const validatedRequest =
      GetMyBlocksByBlockGroupIdsRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockGroupIdsServerFn({
      data: validatedRequest,
    });
    return GetMyBlocksByBlockGroupIdsResponseSchema.parse(response);
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

export const queryFnGetMyBlocksByBlockPackId = async (
  request: GetMyBlocksByBlockPackIdRequest
): Promise<GetMyBlocksByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlocksByBlockPackIdRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockPackIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlocksByBlockPackIdResponseSchema.parse(response);
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

export const queryFnGetAllMyBlocks = async (
  request: GetAllMyBlocksRequest
): Promise<GetAllMyBlocksResponse> => {
  try {
    const validatedRequest = GetAllMyBlocksRequestSchema.parse(request);
    const response = await GetAllMyBlocksServerFn({ data: validatedRequest });
    return GetAllMyBlocksResponseSchema.parse(response);
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

export const mutationFnInsertBlock = async (
  request: InsertBlockRequest
): Promise<InsertBlockResponse> => {
  try {
    const validatedRequest = InsertBlockRequestSchema.parse(request);
    const response = await InsertBlockServerFn({ data: validatedRequest });
    return InsertBlockResponseSchema.parse(response);
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

export const mutationFnInsertBlocks = async (
  request: InsertBlocksRequest
): Promise<InsertBlocksResponse> => {
  try {
    const validatedRequest = InsertBlocksRequestSchema.parse(request);
    const response = await InsertBlocksServerFn({ data: validatedRequest });
    return InsertBlocksResponseSchema.parse(response);
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

export const mutationFnUpdateMyBlockById = async (
  request: UpdateMyBlockByIdRequest
): Promise<UpdateMyBlockByIdResponse> => {
  try {
    const validatedRequest = UpdateMyBlockByIdRequestSchema.parse(request);
    const response = await UpdateMyBlockByIdServerFn({
      data: validatedRequest,
    });
    return UpdateMyBlockByIdResponseSchema.parse(response);
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

export const mutationFnUpdateMyBlocksByIds = async (
  request: UpdateMyBlocksByIdsRequest
): Promise<UpdateMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = UpdateMyBlocksByIdsRequestSchema.parse(request);
    const response = await UpdateMyBlocksByIdsServerFn({
      data: validatedRequest,
    });
    return UpdateMyBlocksByIdsResponseSchema.parse(response);
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

export const mutationFnRestoreMyBlockById = async (
  request: RestoreMyBlockByIdRequest
): Promise<RestoreMyBlockByIdResponse> => {
  try {
    const validatedRequest = RestoreMyBlockByIdRequestSchema.parse(request);
    const response = await RestoreMyBlockByIdServerFn({
      data: validatedRequest,
    });
    return RestoreMyBlockByIdResponseSchema.parse(response);
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

export const mutationFnRestoreMyBlocksByIds = async (
  request: RestoreMyBlocksByIdsRequest
): Promise<RestoreMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = RestoreMyBlocksByIdsRequestSchema.parse(request);
    const response = await RestoreMyBlocksByIdsServerFn({
      data: validatedRequest,
    });
    return RestoreMyBlocksByIdsResponseSchema.parse(response);
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

export const mutationFnDeleteMyBlockById = async (
  request: DeleteMyBlockByIdRequest
): Promise<DeleteMyBlockByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockByIdRequestSchema.parse(request);
    const response = await DeleteMyBlockByIdServerFn({
      data: validatedRequest,
    });
    return DeleteMyBlockByIdResponseSchema.parse(response);
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

export const mutationFnDeleteMyBlocksByIds = async (
  request: DeleteMyBlocksByIdsRequest
): Promise<DeleteMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyBlocksByIdsRequestSchema.parse(request);
    const response = await DeleteMyBlocksByIdsServerFn({
      data: validatedRequest,
    });
    return DeleteMyBlocksByIdsResponseSchema.parse(response);
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
