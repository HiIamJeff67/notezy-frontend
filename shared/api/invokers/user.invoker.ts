import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
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

  const formattedResponse = (await response.json()) as GetUserDataResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
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

  const formattedResponse = (await response.json()) as GetMeResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
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

  const formattedResponse = (await response.json()) as UpdateMeResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}
