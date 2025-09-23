import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  CreateMaterialRequest,
  CreateMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsResponse,
  GetAllMyMaterialsByParentSubShelfIdRequest,
  GetAllMyMaterialsByParentSubShelfIdResponse,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdResponse,
  MoveMyMaterialsByIdsRequest,
  MoveMyMaterialsByIdsResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsResponse,
  SaveMyTextbookMaterialByIdRequest,
  SaveMyTextbookMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";

/* ============================== GetMyMaterialById ============================== */

export async function GetMyMaterialById(
  request: GetMyMaterialByIdRequest
): Promise<GetMyMaterialByIdResponse> {
  const { materialId } = request.param;
  const params = new URLSearchParams({
    materialId: materialId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialById}?${params}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.header.userAgent,
    },
    credentials: "include",
  });

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as GetMyMaterialByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }

  return jsonResponse;
}

/* ============================== GetAllMyMaterialsByParentSubShelfId ============================== */

export async function GetAllMyMaterialsByParentSubShelfId(
  request: GetAllMyMaterialsByParentSubShelfIdRequest
): Promise<GetAllMyMaterialsByParentSubShelfIdResponse> {
  const { parentSubShelfId } = request.param;
  const params = new URLSearchParams({
    parentSubShelfId: parentSubShelfId,
  }).toString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getAllMyMaterialsByParentSubShelfId}?${params}`,
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
  const jsonResponse =
    (await response.json()) as GetAllMyMaterialsByParentSubShelfIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== GetAllMyMaterialsByRootShelfId ============================== */

export async function GetAllMyMaterialsByRootShelfId(
  request: GetAllMyMaterialsByRootShelfIdRequest
): Promise<GetAllMyMaterialsByRootShelfIdResponse> {
  const { rootShelfId } = request.param;
  const params = new URLSearchParams({
    rootShelfId: rootShelfId,
  }).toString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getAllMyMaterialsByRootShelfId}?${params}`,
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
  const jsonResponse =
    (await response.json()) as GetAllMyMaterialsByRootShelfIdResponse;
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

/* ============================== SaveMyTextbookMaterialById ============================== */

export async function SaveMyTextbookMaterialById(
  request: SaveMyTextbookMaterialByIdRequest
): Promise<SaveMyTextbookMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("materialId", request.body.materialId);
  formData.append("rootShelfId", request.body.rootShelfId);
  if (request.body.name) {
    formData.append("name", request.body.name);
  }
  if (request.body.contentFile) {
    formData.append("contentFile", request.body.contentFile);
  }
  if (request.body.size) {
    formData.append("size", request.body.size.toString());
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyTextbookMaterialById}`,
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
  const jsonResponse =
    (await response.json()) as SaveMyTextbookMaterialByIdResponse;
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

/* ============================== MoveMyMaterialsByIds ============================== */

export async function MoveMyMaterialsByIds(
  request: MoveMyMaterialsByIdsRequest
): Promise<MoveMyMaterialsByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialsByIds}`,
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
  const jsonResponse = (await response.json()) as MoveMyMaterialsByIdsResponse;
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
  const jsonResponse =
    (await response.json()) as DeleteMyMaterialsByIdsResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}
