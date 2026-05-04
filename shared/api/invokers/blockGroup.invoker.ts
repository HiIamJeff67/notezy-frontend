import { NotezyAPIError } from "@shared/api/exceptions";
import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsServerFn,
  BatchInsertBlockGroupsByBlockPackIdsServerFn,
  BatchMoveMyBlockGroupsByIdsServerFn,
  DeleteMyBlockGroupByIdServerFn,
  DeleteMyBlockGroupsByIdsServerFn,
  GetAllMyBlockGroupsByBlockPackIdServerFn,
  GetMyBlockGroupAndItsBlocksByIdServerFn,
  GetMyBlockGroupByIdServerFn,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdServerFn,
  GetMyBlockGroupsAndTheirBlocksByIdsServerFn,
  GetMyBlockGroupsByPrevBlockGroupIdServerFn,
  InsertBlockGroupAndItsBlocksByBlockPackIdServerFn,
  InsertBlockGroupByBlockPackIdServerFn,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdServerFn,
  InsertBlockGroupsByBlockPackIdServerFn,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdServerFn,
  MoveMyBlockGroupByIdServerFn,
  MoveMyBlockGroupsByIdsServerFn,
  RestoreMyBlockGroupByIdServerFn,
  RestoreMyBlockGroupsByIdsServerFn,
} from "@shared/api/functions/blockGroup.serverFn";
import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponseSchema,
  BatchInsertBlockGroupsByBlockPackIdsRequest,
  BatchInsertBlockGroupsByBlockPackIdsRequestSchema,
  BatchInsertBlockGroupsByBlockPackIdsResponse,
  BatchInsertBlockGroupsByBlockPackIdsResponseSchema,
  type BatchMoveMyBlockGroupsByIdsRequest,
  BatchMoveMyBlockGroupsByIdsRequestSchema,
  type BatchMoveMyBlockGroupsByIdsResponse,
  BatchMoveMyBlockGroupsByIdsResponseSchema,
  type DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupByIdRequestSchema,
  type DeleteMyBlockGroupByIdResponse,
  DeleteMyBlockGroupByIdResponseSchema,
  type DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsRequestSchema,
  type DeleteMyBlockGroupsByIdsResponse,
  DeleteMyBlockGroupsByIdsResponseSchema,
  type GetAllMyBlockGroupsByBlockPackIdRequest,
  GetAllMyBlockGroupsByBlockPackIdRequestSchema,
  GetAllMyBlockGroupsByBlockPackIdResponse,
  GetAllMyBlockGroupsByBlockPackIdResponseSchema,
  type GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdRequestSchema,
  GetMyBlockGroupAndItsBlocksByIdResponse,
  GetMyBlockGroupAndItsBlocksByIdResponseSchema,
  type GetMyBlockGroupByIdRequest,
  GetMyBlockGroupByIdRequestSchema,
  GetMyBlockGroupByIdResponse,
  GetMyBlockGroupByIdResponseSchema,
  type GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema,
  type GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema,
  GetMyBlockGroupsAndTheirBlocksByIdsResponse,
  GetMyBlockGroupsAndTheirBlocksByIdsResponseSchema,
  type GetMyBlockGroupsByPrevBlockGroupIdRequest,
  GetMyBlockGroupsByPrevBlockGroupIdRequestSchema,
  GetMyBlockGroupsByPrevBlockGroupIdResponse,
  GetMyBlockGroupsByPrevBlockGroupIdResponseSchema,
  type InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema,
  type InsertBlockGroupAndItsBlocksByBlockPackIdResponse,
  InsertBlockGroupAndItsBlocksByBlockPackIdResponseSchema,
  type InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdRequestSchema,
  type InsertBlockGroupByBlockPackIdResponse,
  InsertBlockGroupByBlockPackIdResponseSchema,
  type InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  type InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema,
  InsertBlockGroupsByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdRequestSchema,
  InsertBlockGroupsByBlockPackIdResponse,
  InsertBlockGroupsByBlockPackIdResponseSchema,
  type InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  type InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema,
  type MoveMyBlockGroupByIdRequest,
  MoveMyBlockGroupByIdRequestSchema,
  type MoveMyBlockGroupByIdResponse,
  MoveMyBlockGroupByIdResponseSchema,
  type MoveMyBlockGroupsByIdsRequest,
  MoveMyBlockGroupsByIdsRequestSchema,
  type MoveMyBlockGroupsByIdsResponse,
  MoveMyBlockGroupsByIdsResponseSchema,
  type RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupByIdRequestSchema,
  type RestoreMyBlockGroupByIdResponse,
  RestoreMyBlockGroupByIdResponseSchema,
  type RestoreMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupsByIdsRequestSchema,
  type RestoreMyBlockGroupsByIdsResponse,
  RestoreMyBlockGroupsByIdsResponseSchema,
} from "@shared/api/interfaces/blockGroup.interface";
import { ZodError } from "zod";

export const queryFnGetMyBlockGroupById = async (
  request: GetMyBlockGroupByIdRequest
): Promise<GetMyBlockGroupByIdResponse> => {
  try {
    const validatedRequest = GetMyBlockGroupByIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupByIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockGroupByIdResponseSchema.parse(response);
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

export const queryFnGetMyBlockGroupAndItsBlocksById = async (
  request: GetMyBlockGroupAndItsBlocksByIdRequest
): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockGroupAndItsBlocksByIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupAndItsBlocksByIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockGroupAndItsBlocksByIdResponseSchema.parse(response);
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

export const queryFnGetMyBlockGroupsAndTheirBlocksByIds = async (
  request: GetMyBlockGroupsAndTheirBlocksByIdsRequest
): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> => {
  try {
    const validatedRequest =
      GetMyBlockGroupsAndTheirBlocksByIdsRequestSchema.parse(request);
    const response = await GetMyBlockGroupsAndTheirBlocksByIdsServerFn({
      data: validatedRequest,
    });
    return GetMyBlockGroupsAndTheirBlocksByIdsResponseSchema.parse(response);
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
  request: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupsAndTheirBlocksByBlockPackIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema.parse(
      response
    );
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

export const queryFnGetMyBlockGroupsByPrevBlockGroupId = async (
  request: GetMyBlockGroupsByPrevBlockGroupIdRequest
): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlockGroupsByPrevBlockGroupIdRequestSchema.parse(request);
    const response = await GetMyBlockGroupsByPrevBlockGroupIdServerFn({
      data: validatedRequest,
    });
    return GetMyBlockGroupsByPrevBlockGroupIdResponseSchema.parse(response);
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

export const queryFnGetAllMyBlockGroupsByBlockPackId = async (
  request: GetAllMyBlockGroupsByBlockPackIdRequest
): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      GetAllMyBlockGroupsByBlockPackIdRequestSchema.parse(request);
    const response = await GetAllMyBlockGroupsByBlockPackIdServerFn({
      data: validatedRequest,
    });
    return GetAllMyBlockGroupsByBlockPackIdResponseSchema.parse(response);
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

export const mutationFnInsertBlockGroupByBlockPackId = async (
  request: InsertBlockGroupByBlockPackIdRequest
): Promise<InsertBlockGroupByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      InsertBlockGroupByBlockPackIdRequestSchema.parse(request);
    const response = await InsertBlockGroupByBlockPackIdServerFn({
      data: validatedRequest,
    });
    return InsertBlockGroupByBlockPackIdResponseSchema.parse(response);
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
    const response = await InsertBlockGroupsByBlockPackIdServerFn({
      data: validatedRequest,
    });
    return InsertBlockGroupsByBlockPackIdResponseSchema.parse(response);
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
    const response = await BatchInsertBlockGroupsByBlockPackIdsServerFn({
      data: validatedRequest,
    });
    return BatchInsertBlockGroupsByBlockPackIdsResponseSchema.parse(response);
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
    const response = await InsertBlockGroupAndItsBlocksByBlockPackIdServerFn({
      data: validatedRequest,
    });
    return InsertBlockGroupAndItsBlocksByBlockPackIdResponseSchema.parse(
      response
    );
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
    const response = await InsertBlockGroupsAndTheirBlocksByBlockPackIdServerFn(
      { data: validatedRequest }
    );
    return InsertBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema.parse(
      response
    );
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
        await BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsServerFn({
          data: validatedRequest,
        });
      return BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponseSchema.parse(
        response
      );
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
        await InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdServerFn({
          data: validatedRequest,
        });
      return InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema.parse(
        response
      );
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
    const response = await MoveMyBlockGroupsByIdsServerFn({
      data: validatedRequest,
    });
    return MoveMyBlockGroupByIdResponseSchema.parse(response);
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
    const response = await MoveMyBlockGroupByIdServerFn({
      data: validatedRequest,
    });
    return MoveMyBlockGroupsByIdsResponseSchema.parse(response);
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
    const response = await BatchMoveMyBlockGroupsByIdsServerFn({
      data: validatedRequest,
    });
    return BatchMoveMyBlockGroupsByIdsResponseSchema.parse(response);
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
    const response = await RestoreMyBlockGroupByIdServerFn({
      data: validatedRequest,
    });
    return RestoreMyBlockGroupByIdResponseSchema.parse(response);
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
    const response = await RestoreMyBlockGroupsByIdsServerFn({
      data: validatedRequest,
    });
    return RestoreMyBlockGroupsByIdsResponseSchema.parse(response);
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
    const response = await DeleteMyBlockGroupByIdServerFn({
      data: validatedRequest,
    });
    return DeleteMyBlockGroupByIdResponseSchema.parse(response);
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
    const response = await DeleteMyBlockGroupsByIdsServerFn({
      data: validatedRequest,
    });
    return DeleteMyBlockGroupsByIdsResponseSchema.parse(response);
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
