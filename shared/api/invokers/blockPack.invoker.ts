import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  CreateBlockPackRequest,
  CreateBlockPackResponse,
  DeleteMyBlockPackByIdRequest,
  DeleteMyBlockPackByIdResponse,
  DeleteMyBlockPacksByIdsRequest,
  DeleteMyBlockPacksByIdsResponse,
  GetAllMyBlockPacksByRootShelfIdRequest,
  GetAllMyBlockPacksByRootShelfIdResponse,
  GetMyBlockPackAndItsParentByIdRequest,
  GetMyBlockPackAndItsParentByIdResponse,
  GetMyBlockPackByIdRequest,
  GetMyBlockPackByIdResponse,
  GetMyBlockPacksByParentSubShelfIdRequest,
  GetMyBlockPacksByParentSubShelfIdResponse,
  MoveMyBlockPackByIdRequest,
  MoveMyBlockPackByIdResponse,
  MoveMyBlockPacksByIdsRequest,
  MoveMyBlockPacksByIdsResponse,
  RestoreMyBlockPackByIdRequest,
  RestoreMyBlockPackByIdResponse,
  RestoreMyBlockPacksByIdsRequest,
  RestoreMyBlockPacksByIdsResponse,
  UpdateMyBlockPackByIdRequest,
  UpdateMyBlockPackByIdResponse,
} from "@shared/api/interfaces/blockPack.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@shared/constants/url.constant";
import { tKey } from "@shared/translations";

export async function GetMyBlockPackById(
  request: GetMyBlockPackByIdRequest
): Promise<GetMyBlockPackByIdResponse> {
  const { blockPackId } = request.param;
  const params = new URLSearchParams({ blockPackId: blockPackId }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getMyBlockPackById}?${params}`;

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
    (await response.json()) as GetMyBlockPackByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyBlockPackAndItsParentById(
  request: GetMyBlockPackAndItsParentByIdRequest
): Promise<GetMyBlockPackAndItsParentByIdResponse> {
  const { blockPackId } = request.param;
  const params = new URLSearchParams({ blockPackId: blockPackId }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getMyBlockPackAndItsParentById}?${params}`;

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
    (await response.json()) as GetMyBlockPackAndItsParentByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyBlockPacksByParentSubShelfId(
  request: GetMyBlockPacksByParentSubShelfIdRequest
): Promise<GetMyBlockPacksByParentSubShelfIdResponse> {
  const { parentSubShelfId } = request.param;
  const params = new URLSearchParams({
    parentSubShelfId: parentSubShelfId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getMyBlockPacksByParentSubShelfId}?${params}`;

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
    (await response.json()) as GetMyBlockPacksByParentSubShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetAllMyBlockPacksByRootShelfId(
  request: GetAllMyBlockPacksByRootShelfIdRequest
): Promise<GetAllMyBlockPacksByRootShelfIdResponse> {
  const { rootShelfId } = request.param;
  const params = new URLSearchParams({
    rootShelfId: rootShelfId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.getAllMyBlockPacksByRootShelfId}?${params}`;

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
    (await response.json()) as GetAllMyBlockPacksByRootShelfIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function CreateBlockPack(
  request: CreateBlockPackRequest
): Promise<CreateBlockPackResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.createBlockPack}`,
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

  const formattedResponse = (await response.json()) as CreateBlockPackResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function UpdateMyBlockPackById(
  request: UpdateMyBlockPackByIdRequest
): Promise<UpdateMyBlockPackByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.updateMyBlockPackById}`,
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
    (await response.json()) as UpdateMyBlockPackByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function MoveMyBlockPackById(
  request: MoveMyBlockPackByIdRequest
): Promise<MoveMyBlockPackByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.moveMyBlockPackById}`,
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
    (await response.json()) as MoveMyBlockPackByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function MoveMyBlockPacksByIds(
  request: MoveMyBlockPacksByIdsRequest
): Promise<MoveMyBlockPacksByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.moveMyBlockPacksByIds}`,
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
    (await response.json()) as MoveMyBlockPacksByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function RestoreMyBlockPackById(
  request: RestoreMyBlockPackByIdRequest
): Promise<RestoreMyBlockPackByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.restoreMyBlockPackById}`,
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
    (await response.json()) as RestoreMyBlockPackByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function RestoreMyBlockPacksByIds(
  request: RestoreMyBlockPacksByIdsRequest
): Promise<RestoreMyBlockPacksByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.restoreMyBlockPacksByIds}`,
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
    (await response.json()) as RestoreMyBlockPacksByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function DeleteMyBlockPackById(
  request: DeleteMyBlockPackByIdRequest
): Promise<DeleteMyBlockPackByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.deleteMyBlockPackById}`,
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
    (await response.json()) as DeleteMyBlockPackByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function DeleteMyBlockPacksByIds(
  request: DeleteMyBlockPacksByIdsRequest
): Promise<DeleteMyBlockPacksByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockPack.deleteMyBlockPacksByIds}`,
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
    (await response.json()) as DeleteMyBlockPacksByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}
