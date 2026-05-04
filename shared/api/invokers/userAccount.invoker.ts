import { NotezyAPIError } from "@shared/api/exceptions";
import {
  BindGoogleAccountServerFn,
  GetMyAccountServerFn,
  UnbindGoogleAccountServerFn,
  UpdateMyAccountServerFn,
} from "@shared/api/functions/userAccount.serverFn";
import {
  type BindGoogleAccountRequest,
  BindGoogleAccountRequestSchema,
  type BindGoogleAccountResponse,
  BindGoogleAccountResponseSchema,
  type GetMyAccountRequest,
  GetMyAccountRequestSchema,
  type GetMyAccountResponse,
  GetMyAccountResponseSchema,
  type UnbindGoogleAccountRequest,
  UnbindGoogleAccountRequestSchema,
  type UnbindGoogleAccountResponse,
  UnbindGoogleAccountResponseSchema,
  type UpdateMyAccountRequest,
  UpdateMyAccountRequestSchema,
  type UpdateMyAccountResponse,
  UpdateMyAccountResponseSchema,
} from "@shared/api/interfaces/userAccount.interface";
import { ZodError } from "zod";

export const queryFnGetMyAccount = async (
  request: GetMyAccountRequest
): Promise<GetMyAccountResponse> => {
  try {
    const validatedRequest = GetMyAccountRequestSchema.parse(request);
    const response = await GetMyAccountServerFn({ data: validatedRequest });
    return GetMyAccountResponseSchema.parse(response);
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

export const mutationFnUpdateMyAccount = async (
  request: UpdateMyAccountRequest
): Promise<UpdateMyAccountResponse> => {
  try {
    const validatedRequest = UpdateMyAccountRequestSchema.parse(request);
    const response = await UpdateMyAccountServerFn({ data: validatedRequest });
    return UpdateMyAccountResponseSchema.parse(response);
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

export const mutationFnBindGoogleAccount = async (
  request: BindGoogleAccountRequest
): Promise<BindGoogleAccountResponse> => {
  try {
    const validatedRequest = BindGoogleAccountRequestSchema.parse(request);
    const response = await BindGoogleAccountServerFn({
      data: validatedRequest,
    });
    return BindGoogleAccountResponseSchema.parse(response);
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

export const mutationFnUnbindGoogleAccount = async (
  request: UnbindGoogleAccountRequest
): Promise<UnbindGoogleAccountResponse> => {
  try {
    const validatedRequest = UnbindGoogleAccountRequestSchema.parse(request);
    const response = await UnbindGoogleAccountServerFn({
      data: validatedRequest,
    });
    return UnbindGoogleAccountResponseSchema.parse(response);
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
