import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { Country, UserGender } from "@/shared/types/enums";
import { PrivateUserInfo } from "@/shared/types/models";
import { PartialUpdate } from "@/shared/types/partialUpdate.type";
import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyRequest, NotezyResponse } from "../shared/types/context.type";

/* ============================== GetMyInfo ============================== */
export interface GetMyInfoRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
}

export interface GetMyInfoResponse extends NotezyResponse {
  data: PrivateUserInfo;
}

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
  if (jsonResponse.exception !== null && jsonResponse.exception !== undefined) {
    throw new Error(jsonResponse.exception.message);
  }
  return jsonResponse;
}

/* ============================== UpdateMyInfo ============================== */
export interface UpdateMyInfoRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
  body: PartialUpdate<{
    avatarURL: string | null;
    coverBackgroundURL: string | null;
    header: string | null;
    introduction: string | null;
    gender: UserGender;
    country: Country | null;
    birthDate: Date;
  }>;
}

export interface UpdateMyInfoResponse extends NotezyResponse {
  data: {
    updatedAt: Date;
  };
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

  const jsonResponse = (await response.json()) as UpdateMyInfoResponse;
  if (jsonResponse.exception !== null && jsonResponse.exception !== undefined) {
    throw new Error(jsonResponse.exception.message);
  }
  return jsonResponse;
}
