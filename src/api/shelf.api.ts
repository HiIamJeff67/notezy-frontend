import { isJsonResponse } from "@/util/isJsonContext";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { NotezyRequest, NotezyResponse } from "@shared/types/context.type";
import { PartialUpdate } from "@shared/types/partialUpdate.type";
import { UUID } from "@shared/types/uuid_v4.type";

/* ============================== CreateShelf ============================== */
export interface CreateShelfRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
  body: {
    name: string;
  };
}

export interface CreateShelfResponse extends NotezyResponse {
  data: {
    createdAt: Date;
  };
}

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
    switch (jsonResponse.exception.reason) {
      default:
        throw new Error(jsonResponse.exception.message);
    }
  }

  return jsonResponse;
}

/* ============================== SynchronizeShelves ============================== */
export interface SynchronizeShelvesRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
  body: {
    shelfIds: UUID[];
    partialUpdates: PartialUpdate<{
      name: string;
      encodedStructure: Uint8Array;
    }>[];
  };
}

export interface SynchronizeShelvesResponse extends NotezyResponse {
  data: {
    updatedAt: Date;
  };
}

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
    switch (jsonResponse.exception.reason) {
      default:
        throw new Error(jsonResponse.exception.message);
    }
  }
  return jsonResponse;
}
