import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  CreateMaterialRequest,
  CreateMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsResponse,
  SaveMyMaterialByIdRequest,
  SaveMyMaterialByIdResponse,
  SearchMyMaterialsByShelfIdsRequest,
  SearchMyMaterialsByShelfIdsResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";

/* ============================== GetMyMaterialById ============================== */

export async function GetMyMaterialById(
  request: GetMyMaterialByIdRequest
): Promise<GetMyMaterialByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialById}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as GetMyMaterialByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }

  return jsonResponse;
}

/* ============================== SearchMyMaterialsByShelfIds ============================== */

export async function SearchMyMaterialsByShelfIds(
  request: SearchMyMaterialsByShelfIdsRequest
): Promise<SearchMyMaterialsByShelfIdsResponse> {
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.searchMyMaterialsByShelfId}`;

  if (request.param) {
    const { query, limit, offset } = request.param;
    const params = new URLSearchParams({
      ...(query && { query }),
      ...(limit !== undefined && { limit: String(limit) }),
      ...(offset !== undefined && { offset: String(offset) }),
    }).toString();
    url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.searchMyMaterialsByShelfId}?${params}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.header.userAgent,
    },
    body: JSON.stringify(request.body),
    credentials: "include",
  });

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }
  const jsonResponse =
    (await response.json()) as SearchMyMaterialsByShelfIdsResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== CreateMaterial (including all types) ============================== */

export async function CreateTextbookMaterial(
  request: CreateMaterialRequest
): Promise<CreateMaterialResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createTextbookMaterial}`,
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
  const jsonResponse = (await response.json()) as CreateMaterialResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== SaveMyMaterialById ============================== */

export async function SaveMyMaterialById(
  request: SaveMyMaterialByIdRequest
): Promise<SaveMyMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("materialId", request.body.materialId);
  formData.append("rootShelfId", request.body.rootShelfId);
  if (request.body.partialUpdate) {
    formData.append(
      "partialUpdate",
      JSON.stringify(request.body.partialUpdate)
    );
  }
  if (request.body.contentFile) {
    formData.append("contentFile", request.body.contentFile);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyMaterialById}`,
    {
      method: "PUT",
      headers: {
        "User-Agent": request.header.userAgent,
      },
      body: formData,
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }
  const jsonResponse = (await response.json()) as SaveMyMaterialByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== MoveMyMaterialById ============================== */

export async function MoveMyMaterialById(
  request: MoveMyMaterialByIdRequest
): Promise<MoveMyMaterialByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialById}`,
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
  const jsonResponse = (await response.json()) as MoveMyMaterialByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== RestoreMyMaterialById ============================== */

export async function RestoreMyMaterialById(
  request: RestoreMyMaterialByIdRequest
): Promise<RestoreMyMaterialByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialById}`,
    {
      method: "PATCH",
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
  const jsonResponse = (await response.json()) as RestoreMyMaterialByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== RestoreMyMaterialsByIds ============================== */

export async function RestoreMyMaterialsByIds(
  request: RestoreMyMaterialsByIdsRequest
): Promise<RestoreMyMaterialsByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialsByIds}`,
    {
      method: "PATCH",
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
  const jsonResponse =
    (await response.json()) as RestoreMyMaterialsByIdsResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== DeleteMyMaterialById ============================== */

export async function DeleteMyMaterialById(
  request: DeleteMyMaterialByIdRequest
): Promise<DeleteMyMaterialByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialById}`,
    {
      method: "PATCH",
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
  const jsonResponse = (await response.json()) as DeleteMyMaterialByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== DeleteMyMaterialsByIds ============================== */

export async function DeleteMyMaterialsByIds(
  request: DeleteMyMaterialsByIdsRequest
): Promise<DeleteMyMaterialsByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialsByIds}`,
    {
      method: "PATCH",
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
  const jsonResponse =
    (await response.json()) as DeleteMyMaterialsByIdsResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}
