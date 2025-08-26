import { isJsonResponse } from "@/util/isJsonContext";
import {
  GetMeRequest,
  GetMeResponse,
  GetUserDataRequest,
  GetUserDataResponse,
  UpdateMeRequest,
  UpdateMeResponse,
} from "@shared/api/interfaces/user.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { NotezyAPIError, NotezyException } from "../exceptions";

/* ============================== GetUserData ============================== */

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

  const jsonResponse = (await response.json()) as GetUserDataResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(NotezyException.fromJSON(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== GetMe ============================== */

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
  if (jsonResponse.exception) {
    throw new NotezyAPIError(NotezyException.fromJSON(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== UpdateMe ============================== */

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
  if (jsonResponse.exception) {
    throw new NotezyAPIError(NotezyException.fromJSON(jsonResponse.exception));
  }
  return jsonResponse;
}
