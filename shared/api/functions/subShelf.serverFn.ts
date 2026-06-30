import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  MoveMySubShelvesByRootShelfIdsRequest,
  MoveMySubShelvesByRootShelfIdsResponse,
  CreateSubShelfByRootShelfIdRequest,
  CreateSubShelfByRootShelfIdResponse,
  CreateSubShelvesByRootShelfIdsRequest,
  CreateSubShelvesByRootShelfIdsResponse,
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
  MoveMySubShelvesByRootShelfIdRequest,
  MoveMySubShelvesByRootShelfIdResponse,
  RestoreMySubShelfByIdRequest,
  RestoreMySubShelfByIdResponse,
  RestoreMySubShelvesByIdsRequest,
  RestoreMySubShelvesByIdsResponse,
  UpdateMySubShelfByIdRequest,
  UpdateMySubShelfByIdResponse,
  UpdateMySubShelvesByIdsRequest,
  UpdateMySubShelvesByIdsResponse,
} from "@shared/api/interfaces/subShelf.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const GetMySubShelfById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMySubShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMySubShelfByIdResponse> => {
    const { subShelfId, isDeleted = false } = request.param;
    const params = new URLSearchParams({
      subShelfId: subShelfId,
      isDeleted: String(isDeleted),
    }).toString();
    let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelfById}?${params}`;
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
      (await response.json()) as GetMySubShelfByIdResponse;
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

export const GetMySubShelvesByPrevSubShelfId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMySubShelvesByPrevSubShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMySubShelvesByPrevSubShelfIdResponse> => {
      const { prevSubShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({
        prevSubShelfId: prevSubShelfId,
        areDeleted: String(areDeleted),
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesByPrevSubShelfId}?${params}`;
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
        (await response.json()) as GetMySubShelvesByPrevSubShelfIdResponse;
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

export const GetAllMySubShelvesByRootShelfId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetAllMySubShelvesByRootShelfIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetAllMySubShelvesByRootShelfIdResponse> => {
      const { rootShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({
        rootShelfId: rootShelfId,
        areDeleted: String(areDeleted),
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getAllMySubShelvesByRootShelfId}?${params}`;
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
        (await response.json()) as GetAllMySubShelvesByRootShelfIdResponse;
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

export const GetMySubShelvesAndItemsByPrevSubShelfId = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: GetMySubShelvesAndItemsByPrevSubShelfIdRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<GetMySubShelvesAndItemsByPrevSubShelfIdResponse> => {
      const { prevSubShelfId, areDeleted = false } = request.param;
      const params = new URLSearchParams({
        prevSubShelfId: prevSubShelfId,
        areDeleted: String(areDeleted),
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.getMySubShelvesAndItemsByPrevSubShelfId}?${params}`;
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
        (await response.json()) as GetMySubShelvesAndItemsByPrevSubShelfIdResponse;
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

export const CreateSubShelfByRootShelfId = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateSubShelfByRootShelfIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<CreateSubShelfByRootShelfIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelfByRootShelfId}`,
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
        (await response.json()) as CreateSubShelfByRootShelfIdResponse;
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

export const CreateSubShelvesByRootShelfIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateSubShelvesByRootShelfIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateSubShelvesByRootShelfIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.createSubShelvesByRootShelfIds}`,
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
        (await response.json()) as CreateSubShelvesByRootShelfIdsResponse;
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

export const UpdateMySubShelfById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMySubShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMySubShelfByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelfById}`,
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
      (await response.json()) as UpdateMySubShelfByIdResponse;
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

export const UpdateMySubShelvesByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: UpdateMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<UpdateMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.updateMySubShelvesByIds}`,
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
        (await response.json()) as UpdateMySubShelvesByIdsResponse;
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

export const MoveMySubShelf = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMySubShelfRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMySubShelfResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelf}`,
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
    const formattedResponse = (await response.json()) as MoveMySubShelfResponse;
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

export const MoveMySubShelvesByRootShelfId = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMySubShelvesByRootShelfIdRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMySubShelvesByRootShelfIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelvesByRootShelfId}`,
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
      (await response.json()) as MoveMySubShelvesByRootShelfIdResponse;
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

export const MoveMySubShelvesByRootShelfIds = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMySubShelvesByRootShelfIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<MoveMySubShelvesByRootShelfIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.moveMySubShelvesByRootShelfIds}`,
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
        (await response.json()) as MoveMySubShelvesByRootShelfIdsResponse;
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

export const RestoreMySubShelfById = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMySubShelfByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMySubShelfByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelfById}`,
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
        (await response.json()) as RestoreMySubShelfByIdResponse;
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

export const RestoreMySubShelvesByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.restoreMySubShelvesByIds}`,
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
        (await response.json()) as RestoreMySubShelvesByIdsResponse;
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

export const DeleteMySubShelfById = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMySubShelfByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMySubShelfByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelfById}`,
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
      (await response.json()) as DeleteMySubShelfByIdResponse;
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

export const DeleteMySubShelvesByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteMySubShelvesByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMySubShelvesByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.subShelf.deleteMySubShelvesByIds}`,
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
        (await response.json()) as DeleteMySubShelvesByIdsResponse;
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
