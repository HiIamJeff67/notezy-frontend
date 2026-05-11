import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  SaveMyNotebookMaterialByIdRequest,
  SaveMyNotebookMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";

export async function SaveMyNotebookMaterialById(
  request: SaveMyNotebookMaterialByIdRequest
): Promise<SaveMyNotebookMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("materialId", request.body.materialId);
  if (request.body.contentFile) {
    formData.append("contentFile", request.body.contentFile);
  }

  const clientCookies =
    typeof document !== "undefined" ? document.cookie : undefined;
  const userAgent = request.header?.userAgent ?? "unknown";
  const response = await fetch(
    `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyNotebookMaterialById}`,
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
  const formattedResponse =
    (await response.json()) as SaveMyNotebookMaterialByIdResponse;
  if (formattedResponse.exception != null) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}
