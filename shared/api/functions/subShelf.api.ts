import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  DeleteMySubShelfByIdRequest,
  DeleteMySubShelfByIdResponse,
  DeleteMySubShelvesByIdsRequest,
  DeleteMySubShelvesByIdsResponse,
  GetAllMySubShelvesByRootShelfIdRequest,
  GetAllMySubShelvesByRootShelfIdResponse,
  GetMySubShelfByIdRequest,
  GetMySubShelfByIdResponse,
  GetMySubShelvesByPrevSubShelfIdRequest,
  GetMySubShelvesByPrevSubShelfIdResponse,
  MoveMySubShelfRequest,
  MoveMySubShelfResponse,
  MoveMySubShelvesRequest,
  MoveMySubShelvesResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
} from "@shared/api/interfaces/subShelf.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";

/* ============================== GetMySubShelfById ============================== */

export async function GetMySubShelfById(
  request: GetMySubShelfByIdRequest
): Promise<GetMySubShelfByIdResponse> {
  const { subShelfId } = request.param;
  const params = new URLSearchParams({
    subShelfId: subShelfId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelfById}?${params}`;

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
  const jsonResponse = (await response.json()) as GetMySubShelfByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== GetMySubShelvesByPrevSubShelfId ============================== */

export async function GetMySubShelvesByPrevSubShelfId(
  request: GetMySubShelvesByPrevSubShelfIdRequest
): Promise<GetMySubShelvesByPrevSubShelfIdResponse> {
  const { prevSubShelfId } = request.param;
  const params = new URLSearchParams({
    prevSubShelfId: prevSubShelfId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesByPrevSubShelfId}?${params}`;

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
  const jsonResponse =
    (await response.json()) as GetAllMySubShelvesByRootShelfIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== GetAllMySubShelvesByRootShelfId ============================== */

export async function GetAllMySubShelvesByRootShelfId(
  request: GetAllMySubShelvesByRootShelfIdRequest
): Promise<GetAllMySubShelvesByRootShelfIdResponse> {
  const { rootShelfId } = request.param;
  const params = new URLSearchParams({
    rootShelfId: rootShelfId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getAllMySubShelvesByRootShelfId}?${params}`;

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
  const jsonResponse =
    (await response.json()) as GetAllMySubShelvesByRootShelfIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== CreateSubShelfByRootShelfId ============================== */

export async function CreateSubShelfByRootShelfId(
  request: CreateSubShelfByRootShelfIdRequest
): Promise<CreateSubShelfByRootShelfIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelfByRootShelfId}`,
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
  const jsonResponse =
    (await response.json()) as CreateSubShelfByRootShelfIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== UpdateMySubShelfById ============================== */

export async function UpdateMySubShelfById(
  request: UpdateMySubShelfByIdRequest
): Promise<UpdateMySubShelfByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelfById}`,
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
  const jsonResponse = (await response.json()) as UpdateMySubShelfByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== MoveMySubShelf ============================== */

export async function MoveMySubShelf(
  request: MoveMySubShelfRequest
): Promise<MoveMySubShelfResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelf}`,
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
  const jsonResponse = (await response.json()) as MoveMySubShelfResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== MoveMySubShelves ============================== */

export async function MoveMySubShelves(
  request: MoveMySubShelvesRequest
): Promise<MoveMySubShelvesResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelves}`,
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
  const jsonResponse = (await response.json()) as MoveMySubShelvesResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== RestoreMySubShelfById ============================== */

export async function RestoreMySubShelfById(
  request: RestoreMySubShelfByIdRequest
): Promise<RestoreMySubShelfByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelfById}`,
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
  const jsonResponse = (await response.json()) as RestoreMySubShelfByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== RestoreMySubShelvesByIds ============================== */

export async function RestoreMySubShelvesByIds(
  request: RestoreMySubShelvesByIdsRequest
): Promise<RestoreMySubShelvesByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelvesByIds}`,
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
    (await response.json()) as RestoreMySubShelvesByIdsResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== DeleteMySubShelfById ============================== */

export async function DeleteMySubShelfById(
  request: DeleteMySubShelfByIdRequest
): Promise<DeleteMySubShelfByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelfById}`,
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
  const jsonResponse = (await response.json()) as DeleteMySubShelfByIdResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}

/* ============================== DeleteMySubShelvesByIds ============================== */

export async function DeleteMySubShelvesByIds(
  request: DeleteMySubShelvesByIdsRequest
): Promise<DeleteMySubShelvesByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelvesByIds}`,
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
    (await response.json()) as DeleteMySubShelvesByIdsResponse;
  if (jsonResponse.exception) {
    throw new NotezyAPIError(new NotezyException(jsonResponse.exception));
  }
  return jsonResponse;
}
