import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  CreateNotebookMaterialRequest,
  CreateNotebookMaterialResponse,
  CreateTextbookMaterialRequest,
  CreateTextbookMaterialResponse,
  DeleteMyMaterialByIdRequest,
  DeleteMyMaterialByIdResponse,
  DeleteMyMaterialsByIdsRequest,
  DeleteMyMaterialsByIdsResponse,
  GetAllMyMaterialsByRootShelfIdRequest,
  GetAllMyMaterialsByRootShelfIdResponse,
  GetMyMaterialAndItsParentByIdRequest,
  GetMyMaterialAndItsParentByIdResponse,
  GetMyMaterialByIdRequest,
  GetMyMaterialByIdResponse,
  GetMyMaterialsByParentSubShelfIdRequest,
  GetMyMaterialsByParentSubShelfIdResponse,
  MoveMyMaterialByIdRequest,
  MoveMyMaterialByIdResponse,
  MoveMyMaterialsByIdsRequest,
  MoveMyMaterialsByIdsResponse,
  RestoreMyMaterialByIdRequest,
  RestoreMyMaterialByIdResponse,
  RestoreMyMaterialsByIdsRequest,
  RestoreMyMaterialsByIdsResponse,
  SaveMyNotebookMaterialByIdRequest,
  SaveMyNotebookMaterialByIdResponse,
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";

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
      ...(request.header.authorization
        ? { Authorization: request.header.authorization }
        : {}),
    },
    credentials: "include",
  });

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const formattedResponse =
    (await response.json()) as GetMyMaterialByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyMaterialAndItsParentById(
  request: GetMyMaterialAndItsParentByIdRequest
): Promise<GetMyMaterialAndItsParentByIdResponse> {
  const { materialId } = request.param;
  const params = new URLSearchParams({
    materialId: materialId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialAndItsParentById}?${params}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.header.userAgent,
      ...(request.header.authorization
        ? { Authorization: request.header.authorization }
        : {}),
    },
    credentials: "include",
  });

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const formattedResponse =
    (await response.json()) as GetMyMaterialAndItsParentByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyMaterialsByParentSubShelfId(
  request: GetMyMaterialsByParentSubShelfIdRequest
): Promise<GetMyMaterialsByParentSubShelfIdResponse> {
  const { parentSubShelfId } = request.param;
  const params = new URLSearchParams({
    parentSubShelfId: parentSubShelfId,
  }).toString();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialsByParentSubShelfId}?${params}`,
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

  const formattedResponse =
    (await response.json()) as GetMyMaterialsByParentSubShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as GetAllMyMaterialsByRootShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function CreateTextbookMaterial(
  request: CreateTextbookMaterialRequest
): Promise<CreateTextbookMaterialResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createTextbookMaterial}`,
    {
      method: "POST",
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

  const formattedResponse =
    (await response.json()) as CreateNotebookMaterialResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function CreateNotebookMaterial(
  request: CreateNotebookMaterialRequest
): Promise<CreateNotebookMaterialResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createNotebookMaterial}`,
    {
      method: "POST",
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

  const formattedResponse =
    (await response.json()) as CreateNotebookMaterialResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function UpdateMyMaterialById(
  request: UpdateMyMaterialByIdRequest
): Promise<UpdateMyMaterialByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.updateMyMaterialById}`,
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

  const formattedResponse =
    (await response.json()) as UpdateMyMaterialByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function SaveMyNotebookMaterialById(
  request: SaveMyNotebookMaterialByIdRequest
): Promise<SaveMyNotebookMaterialByIdResponse> {
  const formData = new FormData();
  formData.append("materialId", request.body.materialId);
  if (request.body.contentFile) {
    formData.append("contentFile", request.body.contentFile);
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.saveMyNotebookMaterialById}`,
    {
      method: "PUT",
      headers: {
        // Do NOT set the content type of form-data manually
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
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
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as MoveMyMaterialByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as MoveMyMaterialsByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as RestoreMyMaterialByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as RestoreMyMaterialsByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as DeleteMyMaterialByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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

  const formattedResponse =
    (await response.json()) as DeleteMyMaterialsByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}
