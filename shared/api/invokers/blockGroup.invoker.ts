import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
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
    const response = await GetMyBlockGroupById({
      data: validatedRequest,
    });
    return GetMyBlockGroupByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockGroupById", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await GetMyBlockGroupAndItsBlocksById({
      data: validatedRequest,
    });
    return GetMyBlockGroupAndItsBlocksByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockGroupAndItsBlocksById", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await GetMyBlockGroupsAndTheirBlocksByIds({
      data: validatedRequest,
    });
    return GetMyBlockGroupsAndTheirBlocksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockGroupsAndTheirBlocksByIds", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
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
    const response = await GetMyBlockGroupsAndTheirBlocksByBlockPackId({
      data: validatedRequest,
    });
    return GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema.parse(
      response
    );
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockGroupsAndTheirBlocksByBlockPackId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await GetMyBlockGroupsByPrevBlockGroupId({
      data: validatedRequest,
    });
    return GetMyBlockGroupsByPrevBlockGroupIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockGroupsByPrevBlockGroupId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
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
    const response = await GetAllMyBlockGroupsByBlockPackId({
      data: validatedRequest,
    });
    return GetAllMyBlockGroupsByBlockPackIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyBlockGroupsByBlockPackId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await InsertBlockGroupByBlockPackId({
      data: validatedRequest,
    });
    return InsertBlockGroupByBlockPackIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnInsertBlockGroupByBlockPackId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await InsertBlockGroupsByBlockPackId({
      data: validatedRequest,
    });
    return InsertBlockGroupsByBlockPackIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnInsertBlockGroupsByBlockPackId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await BatchInsertBlockGroupsByBlockPackIds({
      data: validatedRequest,
    });
    return BatchInsertBlockGroupsByBlockPackIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnBatchInsertBlockGroupsByBlockPackIds", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await InsertBlockGroupAndItsBlocksByBlockPackId({
      data: validatedRequest,
    });
    return InsertBlockGroupAndItsBlocksByBlockPackIdResponseSchema.parse(
      response
    );
  } catch (error) {
    console.error("error happening in mutationFnInsertBlockGroupAndItsBlocksByBlockPackId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await InsertBlockGroupsAndTheirBlocksByBlockPackId({
      data: validatedRequest,
    });
    return InsertBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema.parse(
      response
    );
  } catch (error) {
    console.error("error happening in mutationFnInsertBlockGroupsAndTheirBlocksByBlockPackId", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
      const response = await BatchInsertBlockGroupsAndTheirBlocksByBlockPackIds(
        {
          data: validatedRequest,
        }
      );
      return BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponseSchema.parse(
        response
      );
    } catch (error) {
      console.error("error happening in mutationFnBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds", error);
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
      } else if (error instanceof TypeError) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
        await InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId({
          data: validatedRequest,
        });
      return InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponseSchema.parse(
        response
      );
    } catch (error) {
      console.error("error happening in mutationFnInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId", error);
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
      } else if (error instanceof TypeError) {
        throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
      }

      throw error;
    }
  };

export const mutationFnMoveMyBlockGroupById = async (
  request: MoveMyBlockGroupByIdRequest
): Promise<MoveMyBlockGroupByIdResponse> => {
  try {
    const validatedRequest = MoveMyBlockGroupsByIdsRequestSchema.parse(request);
    const response = await MoveMyBlockGroupsByIds({
      data: validatedRequest,
    });
    return MoveMyBlockGroupByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMyBlockGroupById", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};

export const mutationFnMoveMyBlockGroupsByIds = async (
  request: MoveMyBlockGroupsByIdsRequest
): Promise<MoveMyBlockGroupsByIdsResponse> => {
  try {
    const validatedRequest = MoveMyBlockGroupByIdRequestSchema.parse(request);
    const response = await MoveMyBlockGroupById({
      data: validatedRequest,
    });
    return MoveMyBlockGroupsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnMoveMyBlockGroupsByIds", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await BatchMoveMyBlockGroupsByIds({
      data: validatedRequest,
    });
    return BatchMoveMyBlockGroupsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnBatchMoveMyBlockGroupsByIds", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await RestoreMyBlockGroupById({
      data: validatedRequest,
    });
    return RestoreMyBlockGroupByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyBlockGroupById", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await RestoreMyBlockGroupsByIds({
      data: validatedRequest,
    });
    return RestoreMyBlockGroupsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyBlockGroupsByIds", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};

export const mutationFnDeleteMyBlockGroupById = async (
  request: DeleteMyBlockGroupByIdRequest
): Promise<DeleteMyBlockGroupByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockGroupByIdRequestSchema.parse(request);
    const response = await DeleteMyBlockGroupById({
      data: validatedRequest,
    });
    return DeleteMyBlockGroupByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyBlockGroupById", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
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
    const response = await DeleteMyBlockGroupsByIds({
      data: validatedRequest,
    });
    return DeleteMyBlockGroupsByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyBlockGroupsByIds", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        default:
          throw error;
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};
