import { isJsonResponse } from "@/lib/isJsonContext";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { PartialUpdate } from "@/shared/types/partialUpdate.type";
import { PrivateUser } from "@/shared/types/user.type";
import { UserData } from "@/shared/types/userData.type";
import { NotezyRequest, NotezyResponse } from "./form.api";

/* ============================== GetUserData ============================== */
export interface GetUserDataRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
}

export interface GetUserDataResponse extends NotezyResponse {
  data: UserData;
}

export async function GetUserData(
  request: GetUserDataRequest
): Promise<GetUserDataResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.user.getUserData}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
      },
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const data = (await response.json()) as GetUserDataResponse;
  if (data.exception !== null) {
    throw new Error(data.exception.message);
  }
  return data;
}

/* ============================== GetMe ============================== */
export interface GetMeRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
}

export interface GetMeResponse extends NotezyResponse {
  data: PrivateUser;
}

export async function GetMe(request: GetMeRequest): Promise<GetMeResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.user.getMe}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
      },
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as GetMeResponse;
  if (jsonResponse.exception !== null && jsonResponse.exception !== undefined) {
    throw new Error(jsonResponse.exception.message);
  }
  return jsonResponse;
}

/* ============================== UpdateMe ============================== */
export interface UpdateMeRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
  body: PartialUpdate<{
    displayName?: string;
    status?: string;
  }>;
}

export interface UpdateMeResponse extends NotezyResponse {
  data: {
    updatedAt: Date;
  };
}

export async function UpdateMe(
  request: UpdateMeRequest
): Promise<UpdateMeResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.user.updateMe}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as UpdateMeResponse;
  if (jsonResponse.exception !== null && jsonResponse.exception !== undefined) {
    throw new Error(jsonResponse.exception.message);
  }
  return jsonResponse;
}
