import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupByIdResponse,
  DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsResponse,
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetAllMyBlockGroupsByBlockPackIdResponse,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdResponse,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupByIdResponse,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsResponse,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
  GetMyBlockGroupsByPrevBlockGroupIdResponse,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdResponse,
  InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdResponse,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  MoveMyBlockGroupsByIdsRequest,
  MoveMyBlockGroupsByIdsResponse,
  RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupByIdResponse,
  RestoreMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupsByIdsResponse,
} from "@shared/api/interfaces/blockGroup.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@shared/constants/url.constant";
import { tKey } from "@shared/translations";

export async function GetMyBlockGroupById(
  request: GetMyBlockGroupByIdRequest
): Promise<GetMyBlockGroupByIdResponse> {
  const { blockGroupId } = request.param;
  const params = new URLSearchParams({ blockGroupId: blockGroupId }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupById}?${params}`;

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
    (await response.json()) as GetMyBlockGroupByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyBlockGroupAndItsBlocksById(
  request: GetMyBlockGroupAndItsBlocksByIdRequest
): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> {
  const { blockGroupId } = request.param;
  const params = new URLSearchParams({
    blockGroupId: blockGroupId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupAndItsBlocksById}?${params}`;

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
    (await response.json()) as GetMyBlockGroupAndItsBlocksByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyBlockGroupsAndTheirBlocksByIds(
  request: GetMyBlockGroupsAndTheirBlocksByIdsRequest
): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> {
  const { blockGroupIds } = request.param;
  const params = new URLSearchParams();
  blockGroupIds.forEach(blockGroupId => {
    params.append("blockGroupIds", blockGroupId);
  });
  params.toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupAndItsBlocksById}?${params}`;

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
    (await response.json()) as GetMyBlockGroupsAndTheirBlocksByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyBlockGroupsAndTheirBlocksByBlockPackId(
  request: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> {
  const { blockPackId } = request.param;
  const params = new URLSearchParams({
    blockPackId: blockPackId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupsAndTheirBlocksByBlockPackId}?${params}`;

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
    (await response.json()) as GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetMyBlockGroupsByPrevBlockGroupId(
  request: GetMyBlockGroupsByPrevBlockGroupIdRequest
): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> {
  const { prevBlockGroupId } = request.param;
  const params = new URLSearchParams({
    prevBlockGroupId: prevBlockGroupId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupsByPrevBlockGroupId}?${params}`;

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
    (await response.json()) as GetMyBlockGroupsByPrevBlockGroupIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function GetAllMyBlockGroupsByBlockPackId(
  request: GetAllMyBlockGroupsByBlockPackIdRequest
): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> {
  const { blockPackId } = request.param;
  const params = new URLSearchParams({
    blockPackId: blockPackId,
  }).toString();
  let url = `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getAllMyBlockGroupsByBlockPackId}?${params}`;

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
    (await response.json()) as GetAllMyBlockGroupsByBlockPackIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function InsertBlockGroupByBlockPackId(
  request: InsertBlockGroupByBlockPackIdRequest
): Promise<InsertBlockGroupByBlockPackIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupByBlockPackId}`,
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
    (await response.json()) as InsertBlockGroupByBlockPackIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function InsertBlockGroupAndItsBlocksByBlockPackId(
  request: InsertBlockGroupAndItsBlocksByBlockPackIdRequest
): Promise<InsertBlockGroupAndItsBlocksByBlockPackIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupAndItsBlocksByBlockPackId}`,
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
    (await response.json()) as InsertBlockGroupAndItsBlocksByBlockPackIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function InsertBlockGroupsAndTheirBlocksByBlockPackId(
  request: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest
): Promise<InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupsAndTheirBlocksByBlockPackId}`,
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
    (await response.json()) as InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export const InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId =
  async function (
    request: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertSequentialBlockGroupsAndTheirBlocksByBlockPackId}`,
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
      (await response.json()) as InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse;
    if (formattedResponse.exception) {
      throw new NotezyAPIError(
        new NotezyException(formattedResponse.exception)
      );
    }

    return formattedResponse;
  };

export async function MoveMyBlockGroupsByIds(
  request: MoveMyBlockGroupsByIdsRequest
): Promise<MoveMyBlockGroupsByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.moveMyBlockGroupsByIds}`,
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
    (await response.json()) as MoveMyBlockGroupsByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function RestoreMyBlockGroupById(
  request: RestoreMyBlockGroupByIdRequest
): Promise<RestoreMyBlockGroupByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.restoreMyBlockGroupById}`,
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
    (await response.json()) as RestoreMyBlockGroupByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function RestoreMyBlockGroupsByIds(
  request: RestoreMyBlockGroupsByIdsRequest
): Promise<RestoreMyBlockGroupsByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.restoreMyBlockGroupsByIds}`,
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
    (await response.json()) as RestoreMyBlockGroupsByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function DeleteMyBlockGroupById(
  request: DeleteMyBlockGroupByIdRequest
): Promise<DeleteMyBlockGroupByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.deleteMyBlockGroupById}`,
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
    (await response.json()) as DeleteMyBlockGroupByIdResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}

export async function DeleteMyBlockGroupsByIds(
  request: DeleteMyBlockGroupsByIdsRequest
): Promise<DeleteMyBlockGroupsByIdsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.deleteMyBlockGroupsByIds}`,
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
    (await response.json()) as DeleteMyBlockGroupsByIdsResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }

  return formattedResponse;
}
