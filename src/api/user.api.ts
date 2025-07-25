import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@/shared/constants/url.constant";
import { UserData } from "@/shared/types/userData.type";
import { NotezyRequest, NotezyResponse } from "./form.api";

/* ============================== GetMe ============================== */
export interface GetMeRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization: string | undefined;
  };
}

export interface GetMeResponse extends NotezyResponse {
  data: UserData;
}

export async function GetMe(
  request: GetMeRequest
): Promise<GetMeResponse | null> {
  try {
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

    const data = (await response.json()) as GetMeResponse;
    if (data.exception !== null) {
      throw new Error(data.exception.message);
    }
    return data;
  } catch (error) {
    return null;
  }
}
