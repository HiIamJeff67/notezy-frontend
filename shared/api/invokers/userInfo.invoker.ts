import { NotezyAPIError } from "@shared/api/exceptions";
import {
  GetMyInfoServerFn,
  UpdateMyInfoServerFn,
} from "@shared/api/functions/userInfo.serverFn";
import {
  type GetMyInfoRequest,
  GetMyInfoRequestSchema,
  type GetMyInfoResponse,
  GetMyInfoResponseSchema,
  type UpdateMyInfoRequest,
  UpdateMyInfoRequestSchema,
  type UpdateMyInfoResponse,
  UpdateMyInfoResponseSchema,
} from "@shared/api/interfaces/userInfo.interface";
import { ZodError } from "zod";

export const queryFnGetMyInfo = async (
  request: GetMyInfoRequest
): Promise<GetMyInfoResponse> => {
  try {
    const validatedRequest = GetMyInfoRequestSchema.parse(request);
    const response = await GetMyInfoServerFn({ data: validatedRequest });
    return GetMyInfoResponseSchema.parse(response);
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

export const mutationFnUpdateMyInfo = async (
  request: UpdateMyInfoRequest
): Promise<UpdateMyInfoResponse> => {
  try {
    const validatedRequest = UpdateMyInfoRequestSchema.parse(request);
    const response = await UpdateMyInfoServerFn({ data: validatedRequest });
    return UpdateMyInfoResponseSchema.parse(response);
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
