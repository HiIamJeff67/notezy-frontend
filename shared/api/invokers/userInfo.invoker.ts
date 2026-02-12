import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  GetMyInfoRequest,
  GetMyInfoResponse,
  UpdateMyInfoRequest,
  UpdateMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";

export async function GetMyInfo(
  request: GetMyInfoRequest
): Promise<GetMyInfoResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userInfo.getMyInfo}`,
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

  const formattedResponse = (await response.json()) as GetMyInfoResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

export async function UpdateMyInfo(
  request: UpdateMyInfoRequest
): Promise<UpdateMyInfoResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.userInfo.updateMyInfo}`,
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

  const formattedResponse = (await response.json()) as UpdateMyInfoResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}
