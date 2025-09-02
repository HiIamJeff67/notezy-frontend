import { isJsonResponse } from "@/util/isJsonContext";
import {
  CreateShelfRequest,
  CreateShelfResponse,
  DeleteShelfRequest,
  DeleteShelfResponse,
  SynchronizeShelvesRequest,
  SynchronizeShelvesResponse,
} from "@shared/api/interfaces/shelf.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { NotezyAPIError, NotezyException } from "../exceptions";

/* ============================== CreateShelf ============================== */

export async function CreateShelf(
  request: CreateShelfRequest
): Promise<CreateShelfResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.shelf.createShelf}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as CreateShelfResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }

  return jsonResponse;
}

/* ============================== SynchronizeShelves ============================== */

export async function SynchronizeShelves(
  request: SynchronizeShelvesRequest
): Promise<SynchronizeShelvesResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.shelf.synchronizeShelves}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as SynchronizeShelvesResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== Delete Shelf ============================== */

export async function DeleteShelf(
  request: DeleteShelfRequest
): Promise<DeleteShelfResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.shelf.deleteShelf}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as DeleteShelfResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}
