import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
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
  UpdateMyMaterialByIdRequest,
  UpdateMyMaterialByIdResponse,
} from "@shared/api/interfaces/material.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const GetMyMaterialById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyMaterialByIdResponse> => {
    const { materialId } = request.param;
    const params = new URLSearchParams({
      materialId: materialId,
    }).toString();
    let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialById}?${params}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        ...(request.header?.authorization
          ? { Authorization: request.header.authorization }
          : {}),
        ...(inboundCookie ? { Cookie: inboundCookie } : {}),
      },
      credentials: "include",
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as GetMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotezyAPIError(
        new NotezyException(formattedResponse.exception)
      );
    }
    AccessTokenCookieHandler.ensure(
      formattedResponse.refreshableTokens?.newAccessToken
    );

    return formattedResponse;
  });

export const GetMyMaterialAndItsParentById = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyMaterialAndItsParentByIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyMaterialAndItsParentByIdResponse> => {
      const { materialId } = request.param;
      const params = new URLSearchParams({
        materialId: materialId,
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialAndItsParentById}?${params}`;
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.authorization
            ? { Authorization: request.header.authorization }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        credentials: "include",
      });

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as GetMyMaterialAndItsParentByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const GetMyMaterialsByParentSubShelfId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyMaterialsByParentSubShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyMaterialsByParentSubShelfIdResponse> => {
      const { parentSubShelfId } = request.param;
      const params = new URLSearchParams({
        parentSubShelfId: parentSubShelfId,
      }).toString();
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getMyMaterialsByParentSubShelfId}?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as GetMyMaterialsByParentSubShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const GetAllMyMaterialsByRootShelfId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetAllMyMaterialsByRootShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetAllMyMaterialsByRootShelfIdResponse> => {
      const { rootShelfId } = request.param;
      const params = new URLSearchParams({
        rootShelfId: rootShelfId,
      }).toString();
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.getAllMyMaterialsByRootShelfId}?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as GetAllMyMaterialsByRootShelfIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const CreateTextbookMaterial = createServerFn({ method: "POST" })
  .inputValidator((data: CreateTextbookMaterialRequest) => data)
  .handler(
    async ({ data: request }): Promise<CreateTextbookMaterialResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createTextbookMaterial}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateNotebookMaterialResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const CreateNotebookMaterial = createServerFn({ method: "POST" })
  .inputValidator((data: CreateNotebookMaterialRequest) => data)
  .handler(
    async ({ data: request }): Promise<CreateNotebookMaterialResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.createNotebookMaterial}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateNotebookMaterialResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const UpdateMyMaterialById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyMaterialByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.updateMyMaterialById}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.authorization
            ? { Authorization: request.header.authorization }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as UpdateMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotezyAPIError(
        new NotezyException(formattedResponse.exception)
      );
    }
    AccessTokenCookieHandler.ensure(
      formattedResponse.refreshableTokens?.newAccessToken
    );

    return formattedResponse;
  });

export const MoveMyMaterialById = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMyMaterialByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialById}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.authorization
            ? { Authorization: request.header.authorization }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as MoveMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotezyAPIError(
        new NotezyException(formattedResponse.exception)
      );
    }
    AccessTokenCookieHandler.ensure(
      formattedResponse.refreshableTokens?.newAccessToken
    );

    return formattedResponse;
  });

export const MoveMyMaterialsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMyMaterialsByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMyMaterialsByIdsResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.moveMyMaterialsByIds}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.authorization
            ? { Authorization: request.header.authorization }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as MoveMyMaterialsByIdsResponse;
    if (formattedResponse.exception != null) {
      throw new NotezyAPIError(
        new NotezyException(formattedResponse.exception)
      );
    }
    AccessTokenCookieHandler.ensure(
      formattedResponse.refreshableTokens?.newAccessToken
    );

    return formattedResponse;
  });

export const RestoreMyMaterialById = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyMaterialByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyMaterialByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialById}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as RestoreMyMaterialByIdResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const RestoreMyMaterialsByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMyMaterialsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyMaterialsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.restoreMyMaterialsByIds}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as RestoreMyMaterialsByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );

export const DeleteMyMaterialById = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyMaterialByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMyMaterialByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialById}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          ...(request.header?.authorization
            ? { Authorization: request.header.authorization }
            : {}),
          ...(inboundCookie ? { Cookie: inboundCookie } : {}),
        },
        body: JSON.stringify(request.body),
        credentials: "include",
      }
    );

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as DeleteMyMaterialByIdResponse;
    if (formattedResponse.exception != null) {
      throw new NotezyAPIError(
        new NotezyException(formattedResponse.exception)
      );
    }
    AccessTokenCookieHandler.ensure(
      formattedResponse.refreshableTokens?.newAccessToken
    );

    return formattedResponse;
  });

export const DeleteMyMaterialsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyMaterialsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyMaterialsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.material.deleteMyMaterialsByIds}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(request.header?.authorization
              ? { Authorization: request.header.authorization }
              : {}),
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as DeleteMyMaterialsByIdsResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }
      AccessTokenCookieHandler.ensure(
        formattedResponse.refreshableTokens?.newAccessToken
      );

      return formattedResponse;
    }
  );
