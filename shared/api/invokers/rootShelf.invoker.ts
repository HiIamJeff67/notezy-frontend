import { NotezyAPIError } from "@shared/api/exceptions";
import {
  CreateRootShelfServerFn,
  CreateRootShelvesServerFn,
  DeleteMyRootShelfByIdServerFn,
  DeleteMyRootShelvesByIdsServerFn,
  GetMyRootShelfByIdServerFn,
  RestoreMyRootShelfByIdServerFn,
  RestoreMyRootShelvesByIdsServerFn,
  UpdateMyRootShelfByIdServerFn,
  UpdateMyRootShelvesByIdsServerFn,
} from "@shared/api/functions/rootShelf.serverFn";
import {
  type CreateRootShelfRequest,
  CreateRootShelfRequestSchema,
  type CreateRootShelfResponse,
  CreateRootShelfResponseSchema,
  type CreateRootShelvesRequest,
  CreateRootShelvesRequestSchema,
  type CreateRootShelvesResponse,
  CreateRootShelvesResponseSchema,
  type DeleteMyRootShelfByIdRequest,
  DeleteMyRootShelfByIdRequestSchema,
  type DeleteMyRootShelfByIdResponse,
  DeleteMyRootShelfByIdResponseSchema,
  type DeleteMyRootShelvesByIdsRequest,
  DeleteMyRootShelvesByIdsRequestSchema,
  type DeleteMyRootShelvesByIdsResponse,
  DeleteMyRootShelvesByIdsResponseSchema,
  type GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdRequestSchema,
  type GetMyRootShelfByIdResponse,
  GetMyRootShelfByIdResponseSchema,
  type RestoreMyRootShelfByIdRequest,
  RestoreMyRootShelfByIdRequestSchema,
  type RestoreMyRootShelfByIdResponse,
  RestoreMyRootShelfByIdResponseSchema,
  type RestoreMyRootShelvesByIdsRequest,
  RestoreMyRootShelvesByIdsRequestSchema,
  type RestoreMyRootShelvesByIdsResponse,
  RestoreMyRootShelvesByIdsResponseSchema,
  type UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdRequestSchema,
  type UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelfByIdResponseSchema,
  type UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsRequestSchema,
  type UpdateMyRootShelvesByIdsResponse,
  UpdateMyRootShelvesByIdsResponseSchema,
} from "@shared/api/interfaces/rootShelf.interface";
import { ZodError } from "zod";

export const queryFnGetMyRootShelfById = async (
  request: GetMyRootShelfByIdRequest
): Promise<GetMyRootShelfByIdResponse> => {
  try {
    const validatedRequest = GetMyRootShelfByIdRequestSchema.parse(request);
    const response = await GetMyRootShelfByIdServerFn({
      data: validatedRequest,
    });
    return GetMyRootShelfByIdResponseSchema.parse(response);
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

export const mutationFnCreateRootShelf = async (
  request: CreateRootShelfRequest
): Promise<CreateRootShelfResponse> => {
  try {
    const validatedRequest = CreateRootShelfRequestSchema.parse(request);
    const response = await CreateRootShelfServerFn({ data: validatedRequest });
    return CreateRootShelfResponseSchema.parse(response);
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
    const response = await CreateRootShelvesServerFn({
      data: validatedRequest,
    });
    return CreateRootShelvesResponseSchema.parse(response);
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
    const response = await UpdateMyRootShelfByIdServerFn({
      data: validatedRequest,
    });
    return UpdateMyRootShelfByIdResponseSchema.parse(response);
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
    const response = await UpdateMyRootShelvesByIdsServerFn({
      data: validatedRequest,
    });
    return UpdateMyRootShelvesByIdsResponseSchema.parse(response);
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
    const response = await RestoreMyRootShelfByIdServerFn({
      data: validatedRequest,
    });
    return RestoreMyRootShelfByIdResponseSchema.parse(response);
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
    const response = await RestoreMyRootShelvesByIdsServerFn({
      data: validatedRequest,
    });
    return RestoreMyRootShelvesByIdsResponseSchema.parse(response);
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
    const response = await DeleteMyRootShelfByIdServerFn({
      data: validatedRequest,
    });
    return DeleteMyRootShelfByIdResponseSchema.parse(response);
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
    const response = await DeleteMyRootShelvesByIdsServerFn({
      data: validatedRequest,
    });
    return DeleteMyRootShelvesByIdsResponseSchema.parse(response);
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
