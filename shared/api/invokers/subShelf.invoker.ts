import { NotezyAPIError } from "@shared/api/exceptions";
import {
  BatchMoveMySubShelvesServerFn,
  CreateSubShelfByRootShelfIdServerFn,
  CreateSubShelvesByRootShelfIdsServerFn,
  DeleteMySubShelfByIdServerFn,
  DeleteMySubShelvesByIdsServerFn,
  GetAllMySubShelvesByRootShelfIdServerFn,
  GetMySubShelfByIdServerFn,
  GetMySubShelvesAndItemsByPrevSubShelfIdServerFn,
  GetMySubShelvesByPrevSubShelfIdServerFn,
  MoveMySubShelfServerFn,
  MoveMySubShelvesServerFn,
  RestoreMySubShelfByIdServerFn,
  RestoreMySubShelvesByIdsServerFn,
  UpdateMySubShelfByIdServerFn,
  UpdateMySubShelvesByIdsServerFn,
} from "@shared/api/functions/subShelf.serverFn";
import {
  type BatchMoveMySubShelvesRequest,
  BatchMoveMySubShelvesRequestSchema,
  type BatchMoveMySubShelvesResponse,
  BatchMoveMySubShelvesResponseSchema,
  type CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdRequestSchema,
  type CreateSubShelfByRootShelfIdResponse,
  CreateSubShelfByRootShelfIdResponseSchema,
  type CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsRequestSchema,
  type CreateSubShelvesByRootShelfIdsResponse,
  CreateSubShelvesByRootShelfIdsResponseSchema,
  type DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdRequestSchema,
  type DeleteMySubShelfByIdResponse,
  DeleteMySubShelfByIdResponseSchema,
  type DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsRequestSchema,
  type DeleteMySubShelvesByIdsResponse,
  DeleteMySubShelvesByIdsResponseSchema,
  type GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdRequestSchema,
  type GetAllMySubShelvesByRootShelfIdResponse,
  GetAllMySubShelvesByRootShelfIdResponseSchema,
  type GetMySubShelfByIdRequest,
  GetMySubShelfByIdRequestSchema,
  type GetMySubShelfByIdResponse,
  GetMySubShelfByIdResponseSchema,
  type GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema,
  type GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponseSchema,
  type GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdRequestSchema,
  type GetMySubShelvesByPrevSubShelfIdResponse,
  GetMySubShelvesByPrevSubShelfIdResponseSchema,
  type MoveMySubShelfRequest,
  MoveMySubShelfRequestSchema,
  type MoveMySubShelfResponse,
  MoveMySubShelfResponseSchema,
  type MoveMySubShelvesRequest,
  MoveMySubShelvesRequestSchema,
  type MoveMySubShelvesResponse,
  MoveMySubShelvesResponseSchema,
  type RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdRequestSchema,
  type RestoreMySubShelfByIdResponse,
  RestoreMySubShelfByIdResponseSchema,
  type RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsRequestSchema,
  type RestoreMySubShelvesByIdsResponse,
  RestoreMySubShelvesByIdsResponseSchema,
  type UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdRequestSchema,
  type UpdateMySubShelfByIdResponse,
  UpdateMySubShelfByIdResponseSchema,
  type UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsRequestSchema,
  type UpdateMySubShelvesByIdsResponse,
  UpdateMySubShelvesByIdsResponseSchema,
} from "@shared/api/interfaces/subShelf.interface";
import { ZodError } from "zod";

export const queryFnGetMySubShelfById = async (
  request: GetMySubShelfByIdRequest
): Promise<GetMySubShelfByIdResponse> => {
  try {
    const validatedRequest = GetMySubShelfByIdRequestSchema.parse(request);
    const response = await GetMySubShelfByIdServerFn({
      data: validatedRequest,
    });
    return GetMySubShelfByIdResponseSchema.parse(response);
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

export const queryFnGetMySubShelvesByPrevSubShelfId = async (
  request: GetMySubShelvesByPrevSubShelfIdRequest
): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesByPrevSubShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesByPrevSubShelfIdServerFn({
      data: validatedRequest,
    });
    return GetMySubShelvesByPrevSubShelfIdResponseSchema.parse(response);
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

export const queryFnGetAllMySubShelvesByRootShelfId = async (
  request: GetAllMySubShelvesByRootShelfIdRequest
): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      GetAllMySubShelvesByRootShelfIdRequestSchema.parse(request);
    const response = await GetAllMySubShelvesByRootShelfIdServerFn({
      data: validatedRequest,
    });
    return GetAllMySubShelvesByRootShelfIdResponseSchema.parse(response);
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

export const queryFnGetMySubShelvesAndItemsByPrevSubShelfId = async (
  request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
  try {
    const validatedRequest =
      GetMySubShelvesAndItemsByPrevSubShelfIdRequestSchema.parse(request);
    const response = await GetMySubShelvesAndItemsByPrevSubShelfIdServerFn({
      data: validatedRequest,
    });
    return GetMySubShelvesAndItemsByPrevSubShelfIdResponseSchema.parse(
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

export const mutationFnCreateSubShelfByRootShelfId = async (
  request: CreateSubShelfByRootShelfIdRequest
): Promise<CreateSubShelfByRootShelfIdResponse> => {
  try {
    const validatedRequest =
      CreateSubShelfByRootShelfIdRequestSchema.parse(request);
    const response = await CreateSubShelfByRootShelfIdServerFn({
      data: validatedRequest,
    });
    return CreateSubShelfByRootShelfIdResponseSchema.parse(response);
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
    const response = await CreateSubShelvesByRootShelfIdsServerFn({
      data: validatedRequest,
    });
    return CreateSubShelvesByRootShelfIdsResponseSchema.parse(response);
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
    const response = await UpdateMySubShelfByIdServerFn({
      data: validatedRequest,
    });
    return UpdateMySubShelfByIdResponseSchema.parse(response);
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
    const response = await UpdateMySubShelvesByIdsServerFn({
      data: validatedRequest,
    });
    return UpdateMySubShelvesByIdsResponseSchema.parse(response);
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
    const response = await MoveMySubShelfServerFn({ data: validatedRequest });
    return MoveMySubShelfResponseSchema.parse(response);
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
    const response = await MoveMySubShelvesServerFn({ data: validatedRequest });
    return MoveMySubShelvesResponseSchema.parse(response);
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
    const response = await BatchMoveMySubShelvesServerFn({
      data: validatedRequest,
    });
    return BatchMoveMySubShelvesResponseSchema.parse(response);
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
    const response = await RestoreMySubShelfByIdServerFn({
      data: validatedRequest,
    });
    return RestoreMySubShelfByIdResponseSchema.parse(response);
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
    const response = await RestoreMySubShelvesByIdsServerFn({
      data: validatedRequest,
    });
    return RestoreMySubShelvesByIdsResponseSchema.parse(response);
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
    const response = await DeleteMySubShelfByIdServerFn({
      data: validatedRequest,
    });
    return DeleteMySubShelfByIdResponseSchema.parse(response);
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
    const response = await DeleteMySubShelvesByIdsServerFn({
      data: validatedRequest,
    });
    return DeleteMySubShelvesByIdsResponseSchema.parse(response);
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
