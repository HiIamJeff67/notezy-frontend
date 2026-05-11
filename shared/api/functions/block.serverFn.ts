import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlockByIdResponse,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsResponse,
  GetAllMyBlocksRequest,
  GetAllMyBlocksResponse,
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdResponse,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockGroupIdsResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
  InsertBlockRequest,
  InsertBlockResponse,
  InsertBlocksRequest,
  InsertBlocksResponse,
  RestoreMyBlockByIdRequest,
  RestoreMyBlockByIdResponse,
  RestoreMyBlocksByIdsRequest,
  RestoreMyBlocksByIdsResponse,
  UpdateMyBlockByIdRequest,
  UpdateMyBlockByIdResponse,
  UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@shared/constants/url.constant";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const GetMyBlockById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyBlockByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyBlockByIdResponse> => {
    const { blockId } = request.param;
    const params = new URLSearchParams({ blockId }).toString();
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlockById}?${params}`;
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

    const formattedResponse = (await response.json()) as GetMyBlockByIdResponse;
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

export const GetMyBlocksByIds = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyBlocksByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyBlocksByIdsResponse> => {
    const { blockIds } = request.param;
    const params = new URLSearchParams();
    blockIds.forEach(id => params.append("blockIds", id));
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByIds}?${params.toString()}`;
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
      (await response.json()) as GetMyBlocksByIdsResponse;
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

export const GetMyBlocksByBlockGroupId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlocksByBlockGroupIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyBlocksByBlockGroupIdResponse> => {
      const { blockGroupId } = request.param;
      const params = new URLSearchParams({ blockGroupId }).toString();
      const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByBlockGroupId}?${params}`;
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
        (await response.json()) as GetMyBlocksByBlockGroupIdResponse;
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

export const GetMyBlocksByBlockGroupIds = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlocksByBlockGroupIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyBlocksByBlockGroupIdsResponse> => {
      const { blockGroupIds } = request.param;
      const params = new URLSearchParams();
      blockGroupIds.forEach(id => params.append("blockGroupIds", id));
      const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByBlockGroupIds}?${params.toString()}`;
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
        (await response.json()) as GetMyBlocksByBlockGroupIdsResponse;
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

export const GetMyBlocksByBlockPackId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlocksByBlockPackIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<GetMyBlocksByBlockPackIdResponse> => {
      const { blockPackId } = request.param;
      const params = new URLSearchParams({ blockPackId }).toString();
      const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getMyBlocksByBlockPackId}?${params}`;
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
        (await response.json()) as GetMyBlocksByBlockPackIdResponse;
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

export const GetAllMyBlocks = createServerFn({ method: "GET" })
  .inputValidator((data: GetAllMyBlocksRequest) => data)
  .handler(async ({ data: request }): Promise<GetAllMyBlocksResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.getAllMyBlocks}`;
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

    const formattedResponse = (await response.json()) as GetAllMyBlocksResponse;
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

export const InsertBlock = createServerFn({ method: "POST" })
  .inputValidator((data: InsertBlockRequest) => data)
  .handler(async ({ data: request }): Promise<InsertBlockResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.insertBlock}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }

    forwardUpstreamSetCookies(response);

    const formattedResponse = (await response.json()) as InsertBlockResponse;
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

export const InsertBlocks = createServerFn({ method: "POST" })
  .inputValidator((data: InsertBlocksRequest) => data)
  .handler(async ({ data: request }): Promise<InsertBlocksResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.insertBlocks}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }

    forwardUpstreamSetCookies(response);

    const formattedResponse = (await response.json()) as InsertBlocksResponse;
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

export const UpdateMyBlockById = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyBlockByIdRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyBlockByIdResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.updateMyBlockById}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }

    forwardUpstreamSetCookies(response);

    const formattedResponse =
      (await response.json()) as UpdateMyBlockByIdResponse;
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

export const UpdateMyBlocksByIds = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateMyBlocksByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<UpdateMyBlocksByIdsResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.updateMyBlocksByIds}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }

    forwardUpstreamSetCookies(response);

    const formattedResponse =
      (await response.json()) as UpdateMyBlocksByIdsResponse;
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

export const RestoreMyBlockById = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyBlockByIdRequest) => data)
  .handler(async ({ data: request }): Promise<RestoreMyBlockByIdResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.restoreMyBlockById}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }

    forwardUpstreamSetCookies(response);

    const formattedResponse =
      (await response.json()) as RestoreMyBlockByIdResponse;
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

export const RestoreMyBlocksByIds = createServerFn({ method: "POST" })
  .inputValidator((data: RestoreMyBlocksByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<RestoreMyBlocksByIdsResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.restoreMyBlocksByIds}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as RestoreMyBlocksByIdsResponse;
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

export const DeleteMyBlockById = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyBlockByIdRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMyBlockByIdResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.deleteMyBlockById}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as DeleteMyBlockByIdResponse;
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

export const DeleteMyBlocksByIds = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyBlocksByIdsRequest) => data)
  .handler(async ({ data: request }): Promise<DeleteMyBlocksByIdsResponse> => {
    const url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.block.deleteMyBlocksByIds}`;
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(url, {
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
    });

    if (!isJsonResponse(response)) {
      throw new Error(tKey.error.encounterUnknownError);
    }
    forwardUpstreamSetCookies(response);
    const formattedResponse =
      (await response.json()) as DeleteMyBlocksByIdsResponse;
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
