import { isJsonResponse } from "@/util/isJsonContext";
import {
  GetMyInfoRequest,
  GetMyInfoResponse,
  UpdateMyInfoRequest,
  UpdateMyInfoResponse,
} from "@shared/api/interfaces/userInfo.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { NotezyAPIError, NotezyException } from "../exceptions";

/* ============================== GetMyInfo ============================== */

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

  const jsonResponse = (await response.json()) as GetMyInfoResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== UpdateMyInfo ============================== */

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

  const jsonResponse = (await response.json()) as UpdateMyInfoResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}
