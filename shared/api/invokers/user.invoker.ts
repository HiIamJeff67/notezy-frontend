import { NotezyFetchError } from "@shared/api/errors/fetch.error";
import { NotezyValidationError } from "@shared/api/errors/validation.error";
import {
  ExceptionReasonDictionary,
  NotezyAPIError,
} from "@shared/api/exceptions";
import { FetchClientExceptions } from "@shared/api/exceptions/client/fetch.exception";
import { ValidationClientException } from "@shared/api/exceptions/client/validation.exception";
import {
  GetMe,
  GetUserData,
  UpdateMe,
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
    const response = await GetUserData({ data: validatedRequest });
    return GetUserDataResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetUserData", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};

export const queryFnGetMe = async (
  request: GetMeRequest
): Promise<GetMeResponse> => {
  try {
    const validatedRequest = GetMeRequestSchema.parse(request);
    const response = await GetMe({ data: validatedRequest });
    return GetMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in queryFnGetMe", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};

export const mutationFnUpdateMe = async (
  request: UpdateMeRequest
): Promise<UpdateMeResponse> => {
  try {
    const validatedRequest = UpdateMeRequestSchema.parse(request);
    const response = await UpdateMe({ data: validatedRequest });
    return UpdateMeResponseSchema.parse(response);
  } catch (error) {
    console.error("error happening in mutationFnUpdateMe", error);
    if (error instanceof ZodError) {
      throw new NotezyValidationError(
        ValidationClientException.ZodParsingFailed(error)
      );
    } else if (error instanceof NotezyAPIError) {
      switch (error.unWrap.reason) {
        case ExceptionReasonDictionary.user.notFound:
          throw new Error(tKey.error.apiError.getUser.failedToGetUser);
        default:
          throw new Error(error.unWrap.message);
      }
    } else if (error instanceof TypeError) {
      throw new NotezyFetchError(FetchClientExceptions.MissingNetwork());
    }

    throw error;
  }
};
