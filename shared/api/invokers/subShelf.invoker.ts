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
  GetMySubShelvesAndItemsByPrevSubShelfIdRequest,
  GetMySubShelvesAndItemsByPrevSubShelfIdResponse,
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
    (await response.json()) as GetMySubShelfByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as GetMySubShelvesByPrevSubShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as GetAllMySubShelvesByRootShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMySubShelvesAndItemsByPrevSubShelfId(
  request: GetMySubShelvesAndItemsByPrevSubShelfIdRequest
): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> {
  const { prevSubShelfId } = request.param;
  const params = new URLSearchParams({
    prevSubShelfId: prevSubShelfId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesAndItemsByPrevSubShelfId}?${params}`;

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
    (await response.json()) as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

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
    (await response.json()) as CreateSubShelfByRootShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as UpdateMySubShelfByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
  const formattedResponse = (await response.json()) as MoveMySubShelfResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
  const formattedResponse = (await response.json()) as MoveMySubShelvesResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as RestoreMySubShelfByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as RestoreMySubShelvesByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as DeleteMySubShelfByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

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
    (await response.json()) as DeleteMySubShelvesByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}
