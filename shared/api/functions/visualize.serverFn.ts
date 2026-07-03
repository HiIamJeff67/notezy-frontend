import { AccessTokenCookieHandler } from "@shared/api/cookies/accessToken.cookie";
import { forwardUpstreamSetCookies } from "@shared/api/cookies/bridge";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import { CurrentAPIBaseURL } from "@shared/constants/url.constant";
import { tKey } from "@shared/translations";
import { isJsonResponse } from "@shared/util/isJsonContext";
import { getRequestHeader } from "@tanstack/react-start/server";

interface VisualizeServerRequest {
  header?: {
    userAgent?: string;
    authorization?: string;
  };
  param: Record<string, unknown>;
}

export async function fetchVisualizeResponse<TResponse>(
  request: VisualizeServerRequest,
  path: string
): Promise<TResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(request.param)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(
          key,
          entry instanceof Date ? entry.toISOString() : String(entry)
        );
      }
      continue;
    }
    params.set(
      key,
      value instanceof Date ? value.toISOString() : String(value)
    );
  }

  const url =
    import.meta.env.VITE_API_DOMAIN_URL +
    "/" +
    CurrentAPIBaseURL +
    "/" +
    path +
    "?" +
    params.toString();
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
  const formattedResponse = (await response.json()) as TResponse & {
    exception: ConstructorParameters<typeof NotezyException>[0] | null;
    refreshableTokens?: { newAccessToken?: string };
  };
  if (formattedResponse.exception != null) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  AccessTokenCookieHandler.ensure(
    formattedResponse.refreshableTokens?.newAccessToken
  );

  return formattedResponse;
}
