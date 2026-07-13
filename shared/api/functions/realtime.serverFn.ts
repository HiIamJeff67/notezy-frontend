import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import type {
  CreateMyBlockPackChannelTicketRequest,
  CreateMyBlockPackChannelTicketResponse,
  CreateMyRealtimeConnectionTicketRequest,
  CreateMyRealtimeConnectionTicketResponse,
} from "@shared/api/interfaces/realtime.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const CreateMyRealtimeConnectionTicket = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateMyRealtimeConnectionTicketRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateMyRealtimeConnectionTicketResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.realtime.createMyRealtimeConnectionTicket}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
            ...(inboundCookie ? { Cookie: inboundCookie } : {}),
          },
          body: JSON.stringify(request.body ?? {}),
          credentials: "include",
        }
      );

      if (!isJsonResponse(response)) {
        throw new Error(tKey.error.encounterUnknownError);
      }
      forwardUpstreamSetCookies(response);
      const formattedResponse =
        (await response.json()) as CreateMyRealtimeConnectionTicketResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );

export const CreateMyBlockPackChannelTicket = createServerFn({
  method: "POST",
})
  .inputValidator((data: CreateMyBlockPackChannelTicketRequest) => data)
  .handler(
    async ({
      data: request,
    }): Promise<CreateMyBlockPackChannelTicketResponse> => {
      const inboundCookie = getRequestHeader("cookie");
      const userAgent =
        request.header?.userAgent ??
        getRequestHeader("User-Agent") ??
        "unknown";
      const response = await fetch(
        `${import.meta.env.VITE_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.realtime.createMyBlockPackChannelTicket}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": userAgent,
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
        (await response.json()) as CreateMyBlockPackChannelTicketResponse;
      if (formattedResponse.exception != null) {
        throw new NotezyAPIError(
          new NotezyException(formattedResponse.exception)
        );
      }

      return formattedResponse;
    }
  );
