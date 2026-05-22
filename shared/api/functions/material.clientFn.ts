import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";

export async function SaveMyMaterialById(
  request: SaveMyMaterialByIdRequest
): Promise<SaveMyMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("materialId", request.body.materialId);
  formData.append("contentFile", request.body.contentFile);

  const clientCookies =
    typeof document !== "undefined" ? document.cookie : undefined;
  const userAgent = request.header?.userAgent ?? "unknown";
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyMaterialById}`,
    {
      method: "PUT",
      headers: {
        "User-Agent": userAgent,
        ...(request.header?.authorization
          ? { Authorization: request.header.authorization }
          : {}),
        ...(clientCookies ? { "X-Client-Cookies": clientCookies } : {}),
      },
      body: formData,
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }
  const formattedResponse = (await response.json()) as SaveMyMaterialByIdResponse;
  if (formattedResponse.exception != null) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}
