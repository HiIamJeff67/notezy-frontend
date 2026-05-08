import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse,
  BatchInsertBlockGroupsByBlockPackIdsRequest,
  BatchInsertBlockGroupsByBlockPackIdsResponse,
  BatchMoveMyBlockGroupsByIdsRequest,
  BatchMoveMyBlockGroupsByIdsResponse,
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
  InsertBlockGroupsByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdResponse,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  MoveMyBlockGroupByIdRequest,
  MoveMyBlockGroupByIdResponse,
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
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { isJsonResponse } from "@/util/isJsonContext";

export const GetMyBlockGroupById = createServerFn({ method: "GET" })
  .inputValidator((data: GetMyBlockGroupByIdRequest) => data)
  .handler(async ({ data: request }): Promise<GetMyBlockGroupByIdResponse> => {
    const { blockGroupId } = request.param;
    const params = new URLSearchParams({
      blockGroupId: blockGroupId,
    }).toString();
    let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupById}?${params}`;
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
      (await response.json()) as GetMyBlockGroupByIdResponse;
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

export const GetMyBlockGroupAndItsBlocksById = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlockGroupAndItsBlocksByIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyBlockGroupAndItsBlocksByIdResponse> => {
      const { blockGroupId } = request.param;
      const params = new URLSearchParams({
        blockGroupId: blockGroupId,
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupAndItsBlocksById}?${params}`;
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
        (await response.json()) as GetMyBlockGroupAndItsBlocksByIdResponse;
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

export const GetMyBlockGroupsAndTheirBlocksByIds = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlockGroupsAndTheirBlocksByIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyBlockGroupsAndTheirBlocksByIdsResponse> => {
      const { blockGroupIds } = request.param;
      const params = new URLSearchParams();
      blockGroupIds.forEach(blockGroupId => {
        params.append("blockGroupIds", blockGroupId);
      });
      params.toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupAndItsBlocksById}?${params}`;
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
        (await response.json()) as GetMyBlockGroupsAndTheirBlocksByIdsResponse;
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

export const GetMyBlockGroupsAndTheirBlocksByBlockPackId = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
      const { blockPackId } = request.param;
      const params = new URLSearchParams({
        blockPackId: blockPackId,
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupsAndTheirBlocksByBlockPackId}?${params}`;
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
        (await response.json()) as GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse;
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

export const GetMyBlockGroupsByPrevBlockGroupId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetMyBlockGroupsByPrevBlockGroupIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetMyBlockGroupsByPrevBlockGroupIdResponse> => {
      const { prevBlockGroupId } = request.param;
      const params = new URLSearchParams({
        prevBlockGroupId: prevBlockGroupId,
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getMyBlockGroupsByPrevBlockGroupId}?${params}`;
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
        (await response.json()) as GetMyBlockGroupsByPrevBlockGroupIdResponse;
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

export const GetAllMyBlockGroupsByBlockPackId = createServerFn({
  method: "GET",
})
  .inputValidator((data: GetAllMyBlockGroupsByBlockPackIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<GetAllMyBlockGroupsByBlockPackIdResponse> => {
      const { blockPackId } = request.param;
      const params = new URLSearchParams({
        blockPackId: blockPackId,
      }).toString();
      let url = `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.getAllMyBlockGroupsByBlockPackId}?${params}`;
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
        (await response.json()) as GetAllMyBlockGroupsByBlockPackIdResponse;
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

export const InsertBlockGroupByBlockPackId = createServerFn({
  method: "POST",
})
  .inputValidator((data: InsertBlockGroupByBlockPackIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<InsertBlockGroupByBlockPackIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupByBlockPackId}`,
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
        (await response.json()) as InsertBlockGroupByBlockPackIdResponse;
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

export const InsertBlockGroupsByBlockPackId = createServerFn({
  method: "POST",
})
  .inputValidator((data: InsertBlockGroupsByBlockPackIdRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<InsertBlockGroupsByBlockPackIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupsByBlockPackId}`,
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
        (await response.json()) as InsertBlockGroupsByBlockPackIdResponse;
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

export const BatchInsertBlockGroupsByBlockPackIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: BatchInsertBlockGroupsByBlockPackIdsRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<BatchInsertBlockGroupsByBlockPackIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.batchInsertBlockGroupsByBlockPackIds}`,
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
        (await response.json()) as BatchInsertBlockGroupsByBlockPackIdsResponse;
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

export const InsertBlockGroupAndItsBlocksByBlockPackId = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: InsertBlockGroupAndItsBlocksByBlockPackIdRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<InsertBlockGroupAndItsBlocksByBlockPackIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupAndItsBlocksByBlockPackId}`,
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
        (await response.json()) as InsertBlockGroupAndItsBlocksByBlockPackIdResponse;
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

export const InsertBlockGroupsAndTheirBlocksByBlockPackId = createServerFn({
  method: "POST",
})
  .inputValidator(
    (data: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertBlockGroupsAndTheirBlocksByBlockPackId}`,
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
        (await response.json()) as InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse;
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

export const BatchInsertBlockGroupsAndTheirBlocksByBlockPackIds =
  createServerFn({ method: "POST" })
    .inputValidator(
      (data: BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest) => data
    )
    .handler(
      async ({
        data: request,
      }): Promise<BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse> => {
        const inboundCookie = getRequestHeader("cookie");
        const userAgent =
          request.header?.userAgent ??
          getRequestHeader("User-Agent") ??
          "unknown";
        const response = await fetch(
          `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.batchInsertBlockGroupsAndTheirBlocksByBlockPackIds}`,
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
          (await response.json()) as BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse;
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

export const InsertSequentialBlockGroupsAndTheirBlocksByBlockPackId =
  createServerFn({
    method: "POST",
  })
    .inputValidator(
      (data: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest) =>
        data
    )
    .handler(
      async ({
        data: request,
      }): Promise<InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse> => {
        const inboundCookie = getRequestHeader("cookie");
        const userAgent =
          request.header?.userAgent ??
          getRequestHeader("User-Agent") ??
          "unknown";
        const response = await fetch(
          `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.insertSequentialBlockGroupsAndTheirBlocksByBlockPackId}`,
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
          (await response.json()) as InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse;
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

export const MoveMyBlockGroupById = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMyBlockGroupByIdRequest) => data)
  .handler(async ({ data: request }): Promise<MoveMyBlockGroupByIdResponse> => {
    const inboundCookie = getRequestHeader("cookie");
    const userAgent =
      request.header?.userAgent ?? getRequestHeader("User-Agent") ?? "unknown";
    const response = await fetch(
      `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.moveMyBlockGroupById}`,
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
      (await response.json()) as MoveMyBlockGroupByIdResponse;
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

export const MoveMyBlockGroupsByIds = createServerFn({ method: "POST" })
  .inputValidator((data: MoveMyBlockGroupsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<MoveMyBlockGroupsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.moveMyBlockGroupsByIds}`,
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
        (await response.json()) as MoveMyBlockGroupsByIdsResponse;
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

export const BatchMoveMyBlockGroupsByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: BatchMoveMyBlockGroupsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<BatchMoveMyBlockGroupsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.batchMoveMyBlockGroupsByIds}`,
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
        (await response.json()) as BatchMoveMyBlockGroupsByIdsResponse;
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

export const RestoreMyBlockGroupById = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMyBlockGroupByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyBlockGroupByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.restoreMyBlockGroupById}`,
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
        (await response.json()) as RestoreMyBlockGroupByIdResponse;
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

export const RestoreMyBlockGroupsByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: RestoreMyBlockGroupsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<RestoreMyBlockGroupsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.restoreMyBlockGroupsByIds}`,
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
        (await response.json()) as RestoreMyBlockGroupsByIdsResponse;
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

export const DeleteMyBlockGroupById = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteMyBlockGroupByIdRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyBlockGroupByIdResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.deleteMyBlockGroupById}`,
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
        (await response.json()) as DeleteMyBlockGroupByIdResponse;
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

export const DeleteMyBlockGroupsByIds = createServerFn({
  method: "POST",
})
  .inputValidator((data: DeleteMyBlockGroupsByIdsRequest) => data)
  .handler(
    async ({ data: request }): Promise<DeleteMyBlockGroupsByIdsResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.blockGroup.deleteMyBlockGroupsByIds}`,
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
        (await response.json()) as DeleteMyBlockGroupsByIdsResponse;
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
