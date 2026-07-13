import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  GetAllMyBlocksRequest,
  GetAllMyBlocksResponse,
  GetMyBlockByIdRequest,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsRequest,
  GetMyBlocksByIdsResponse,
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
