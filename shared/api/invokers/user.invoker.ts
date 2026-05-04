import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import {
  GetMeServerFn,
  GetUserDataServerFn,
  UpdateMeServerFn,
} from "@shared/api/functions/user.serverFn";
import {
  type GetMeRequest,
  GetMeRequestSchema,
  type GetMeResponse,
  GetMeResponseSchema,
  type GetUserDataRequest,
  GetUserDataRequestSchema,
  type GetUserDataResponse,
  GetUserDataResponseSchema,
  type UpdateMeRequest,
  UpdateMeRequestSchema,
  type UpdateMeResponse,
  UpdateMeResponseSchema,
} from "@shared/api/interfaces/user.interface";
import { tKey } from "@shared/translations";
import { ZodError } from "zod";

export const queryFnGetUserData = async (
  request: GetUserDataRequest
): Promise<GetUserDataResponse> => {
  try {
    const validatedRequest = GetUserDataRequestSchema.parse(request);
    const response = await GetUserDataServerFn({ data: validatedRequest });
    return GetUserDataResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    }

    throw error;
  }
};

export const queryFnGetMe = async (
  request: GetMeRequest
): Promise<GetMeResponse> => {
  try {
    const validatedRequest = GetMeRequestSchema.parse(request);
    const response = await GetMeServerFn({ data: validatedRequest });
    return GetMeResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    }

    throw error;
  }
};

export const mutationFnUpdateMe = async (
  request: UpdateMeRequest
): Promise<UpdateMeResponse> => {
  try {
    const validatedRequest = UpdateMeRequestSchema.parse(request);
    const response = await UpdateMeServerFn({ data: validatedRequest });
    return UpdateMeResponseSchema.parse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(", ");
      throw new Error(`validation failed : ${errorMessage}`);
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    }

    throw error;
  }
};
