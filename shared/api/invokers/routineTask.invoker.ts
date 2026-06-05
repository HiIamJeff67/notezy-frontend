import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import { NotezyAPIError } from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  CreateRoutineTaskByStationId,
  GetMyRoutineTaskById,
  HardDeleteMyRoutineTaskById,
  HardDeleteMyRoutineTasksByIds,
  UpdateMyRoutineTaskById,
} from "@shared/api/functions/routineTask.serverFn";
import {
  CreateRoutineTaskByStationIdRequest,
  CreateRoutineTaskByStationIdRequestSchema,
  CreateRoutineTaskByStationIdResponse,
  CreateRoutineTaskByStationIdResponseSchema,
  GetMyRoutineTaskByIdRequest,
  GetMyRoutineTaskByIdRequestSchema,
  GetMyRoutineTaskByIdResponse,
  GetMyRoutineTaskByIdResponseSchema,
  HardDeleteMyRoutineTaskByIdRequest,
  HardDeleteMyRoutineTaskByIdRequestSchema,
  HardDeleteMyRoutineTaskByIdResponse,
  HardDeleteMyRoutineTaskByIdResponseSchema,
  HardDeleteMyRoutineTasksByIdsRequest,
  HardDeleteMyRoutineTasksByIdsRequestSchema,
  HardDeleteMyRoutineTasksByIdsResponse,
  HardDeleteMyRoutineTasksByIdsResponseSchema,
  UpdateMyRoutineTaskByIdRequest,
  UpdateMyRoutineTaskByIdRequestSchema,
  UpdateMyRoutineTaskByIdResponse,
  UpdateMyRoutineTaskByIdResponseSchema,
} from "@shared/api/interfaces/routineTask.interface";
import { ZodError } from "zod";

export const queryFnGetMyRoutineTaskById = async (
  request: GetMyRoutineTaskByIdRequest
): Promise<GetMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest = GetMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await GetMyRoutineTaskById({
      data: validatedRequest,
    });
    return GetMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMyRoutineTaskById", error);
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

export const mutationFnCreateRoutineTaskByStationId = async (
  request: CreateRoutineTaskByStationIdRequest
): Promise<CreateRoutineTaskByStationIdResponse> => {
  try {
    const validatedRequest =
      CreateRoutineTaskByStationIdRequestSchema.parse(request);
    const response = await CreateRoutineTaskByStationId({
      data: validatedRequest,
    });
    return CreateRoutineTaskByStationIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnCreateRoutineTaskByStationId",
      error
    );
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

export const mutationFnUpdateMyRoutineTaskById = async (
  request: UpdateMyRoutineTaskByIdRequest
): Promise<UpdateMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest =
      UpdateMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await UpdateMyRoutineTaskById({
      data: validatedRequest,
    });
    return UpdateMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnUpdateMyRoutineTaskById",
      error
    );
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

export const mutationFnHardDeleteMyRoutineTaskById = async (
  request: HardDeleteMyRoutineTaskByIdRequest
): Promise<HardDeleteMyRoutineTaskByIdResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTaskByIdRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineTaskById({
      data: validatedRequest,
    });
    return HardDeleteMyRoutineTaskByIdResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineTaskById",
      error
    );
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

export const mutationFnHardDeleteMyRoutineTasksByIds = async (
  request: HardDeleteMyRoutineTasksByIdsRequest
): Promise<HardDeleteMyRoutineTasksByIdsResponse> => {
  try {
    const validatedRequest =
      HardDeleteMyRoutineTasksByIdsRequestSchema.parse(request);
    const response = await HardDeleteMyRoutineTasksByIds({
      data: validatedRequest,
    });
    return HardDeleteMyRoutineTasksByIdsResponseSchema.parse(response);
  } catch (error) {
    console.error(
      "error happening in mutationFnHardDeleteMyRoutineTasksByIds",
      error
    );
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
