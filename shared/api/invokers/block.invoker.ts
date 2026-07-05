import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  DeleteMyBlockById,
  DeleteMyBlocksByIds,
  GetAllMyBlocks,
  GetMyBlockById,
  GetMyBlocksByBlockPackId,
  GetMyBlocksByIds,
  InsertBlock,
  InsertBlocks,
  RestoreMyBlockById,
  RestoreMyBlocksByIds,
  UpdateMyBlockById,
  UpdateMyBlocksByIds,
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
    const response = await GetMyBlockById({ data: validatedRequest });
    return GetMyBlockByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlockById", error);
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

export const queryFnGetMyBlocksByIds = async (
  request: GetMyBlocksByIdsRequest
): Promise<GetMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = GetMyBlocksByIdsRequestSchema.parse(request);
    const response = await GetMyBlocksByIds({ data: validatedRequest });
    return GetMyBlocksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlocksByIds", error);
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

export const queryFnGetMyBlocksByBlockPackId = async (
  request: GetMyBlocksByBlockPackIdRequest
): Promise<GetMyBlocksByBlockPackIdResponse> => {
  try {
    const validatedRequest =
      GetMyBlocksByBlockPackIdRequestSchema.parse(request);
    const response = await GetMyBlocksByBlockPackId({
      data: validatedRequest,
    });
    return GetMyBlocksByBlockPackIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyBlocksByBlockPackId", error);
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

export const queryFnGetAllMyBlocks = async (
  request: GetAllMyBlocksRequest
): Promise<GetAllMyBlocksResponse> => {
  try {
    const validatedRequest = GetAllMyBlocksRequestSchema.parse(request);
    const response = await GetAllMyBlocks({ data: validatedRequest });
    return GetAllMyBlocksResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetAllMyBlocks", error);
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

export const mutationFnInsertBlock = async (
  request: InsertBlockRequest
): Promise<InsertBlockResponse> => {
  try {
    const validatedRequest = InsertBlockRequestSchema.parse(request);
    const response = await InsertBlock({ data: validatedRequest });
    return InsertBlockResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnInsertBlock", error);
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

export const mutationFnInsertBlocks = async (
  request: InsertBlocksRequest
): Promise<InsertBlocksResponse> => {
  try {
    const validatedRequest = InsertBlocksRequestSchema.parse(request);
    const response = await InsertBlocks({ data: validatedRequest });
    return InsertBlocksResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnInsertBlocks", error);
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

export const mutationFnUpdateMyBlockById = async (
  request: UpdateMyBlockByIdRequest
): Promise<UpdateMyBlockByIdResponse> => {
  try {
    const validatedRequest = UpdateMyBlockByIdRequestSchema.parse(request);
    const response = await UpdateMyBlockById({
      data: validatedRequest,
    });
    return UpdateMyBlockByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyBlockById", error);
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

export const mutationFnUpdateMyBlocksByIds = async (
  request: UpdateMyBlocksByIdsRequest
): Promise<UpdateMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = UpdateMyBlocksByIdsRequestSchema.parse(request);
    const response = await UpdateMyBlocksByIds({
      data: validatedRequest,
    });
    return UpdateMyBlocksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMyBlocksByIds", error);
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

export const mutationFnRestoreMyBlockById = async (
  request: RestoreMyBlockByIdRequest
): Promise<RestoreMyBlockByIdResponse> => {
  try {
    const validatedRequest = RestoreMyBlockByIdRequestSchema.parse(request);
    const response = await RestoreMyBlockById({
      data: validatedRequest,
    });
    return RestoreMyBlockByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyBlockById", error);
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

export const mutationFnRestoreMyBlocksByIds = async (
  request: RestoreMyBlocksByIdsRequest
): Promise<RestoreMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = RestoreMyBlocksByIdsRequestSchema.parse(request);
    const response = await RestoreMyBlocksByIds({
      data: validatedRequest,
    });
    return RestoreMyBlocksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnRestoreMyBlocksByIds", error);
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

export const mutationFnDeleteMyBlockById = async (
  request: DeleteMyBlockByIdRequest
): Promise<DeleteMyBlockByIdResponse> => {
  try {
    const validatedRequest = DeleteMyBlockByIdRequestSchema.parse(request);
    const response = await DeleteMyBlockById({
      data: validatedRequest,
    });
    return DeleteMyBlockByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyBlockById", error);
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

export const mutationFnDeleteMyBlocksByIds = async (
  request: DeleteMyBlocksByIdsRequest
): Promise<DeleteMyBlocksByIdsResponse> => {
  try {
    const validatedRequest = DeleteMyBlocksByIdsRequestSchema.parse(request);
    const response = await DeleteMyBlocksByIds({
      data: validatedRequest,
    });
    return DeleteMyBlocksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnDeleteMyBlocksByIds", error);
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
