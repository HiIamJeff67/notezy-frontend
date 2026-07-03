import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import type {
  GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest,
  GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse,
  VisualizeMyRoutineTaskRecordActualEndedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualEndedAtCountResponse,
  VisualizeMyRoutineTaskRecordActualStartedAtCountRequest,
  VisualizeMyRoutineTaskRecordActualStartedAtCountResponse,
  VisualizeMyRoutineTaskRecordPurposeCountRequest,
  VisualizeMyRoutineTaskRecordPurposeCountResponse,
  VisualizeMyRoutineTaskRecordScheduledAtCountRequest,
  VisualizeMyRoutineTaskRecordScheduledAtCountResponse,
  VisualizeMyRoutineTaskRecordStatusCountRequest,
  VisualizeMyRoutineTaskRecordStatusCountResponse,
} from "@shared/api/interfaces/routineTaskRecord.interface";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@shared/constants/url.constant";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { fetchVisualizeResponse } from "./visualize.serverFn";

export const VisualizeMyRoutineTaskRecordStatusCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordStatusCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordStatusCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordStatusCount
      )
  );

export const VisualizeMyRoutineTaskRecordPurposeCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordPurposeCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordPurposeCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordPurposeCount
      )
  );

export const VisualizeMyRoutineTaskRecordScheduledAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordScheduledAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordScheduledAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordScheduledAtCount
      )
  );

export const VisualizeMyRoutineTaskRecordActualStartedAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordActualStartedAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordActualStartedAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordActualStartedAtCount
      )
  );

export const VisualizeMyRoutineTaskRecordActualEndedAtCount = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: VisualizeMyRoutineTaskRecordActualEndedAtCountRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<VisualizeMyRoutineTaskRecordActualEndedAtCountResponse> =>
      fetchVisualizeResponse(
        request,
        APIURLPathDictionary.routineTaskRecord
          .visualizeMyRoutineTaskRecordActualEndedAtCount
      )
  );

export const GetAllMyRoutineTaskRecordsByRoutineTaskId = createServerFn({
  method: "GET",
})
  .inputValidator(
    (data: GetAllMyRoutineTaskRecordsByRoutineTaskIdRequest) => data
  )
  .handler(
    async ({
      data: request,
    }): Promise<GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse> => {
      const params = new URLSearchParams();
      params.set("routineTaskId", request.param.routineTaskId);
      if (request.param.limit !== undefined) {
        params.set("limit", String(request.param.limit));
      }
      const url =
        import.meta.env.VITE_API_DOMAIN_URL +
        "/" +
        CurrentAPIBaseURL +
        "/" +
        APIURLPathDictionary.routineTaskRecord
          .getAllMyRoutineTaskRecordsByRoutineTaskId +
        "?" +
        params.toString();
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
        (await response.json()) as GetAllMyRoutineTaskRecordsByRoutineTaskIdResponse;
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
