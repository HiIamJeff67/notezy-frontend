import { NotezyAPIError } from "@shared/api/exceptions";
import { RealtimeError } from "@shared/api/exceptions/client/realtime.exception";
import { CurrentRealtimeBaseURL } from "@shared/constants";
import { RedirectState } from "@shared/types/redirectState.type";

/* ============================== Search Params ============================== */

export const getOAuthGoogleSearchParamsString = (
  state: RedirectState
): string => {
  const config = {
    redirect_uri: import.meta.env.VITE_OAUTH_GOOGLE_REDIRECT_URL,
    client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: btoa(JSON.stringify(state)),
  };

  return new URLSearchParams(config as Record<string, string>).toString();
};

export const getOAuthXSearchParamsString = (
  state: RedirectState,
  codeChallenge: string
): string => {
  const config = {
    response_type: "code",
    redirect_uri: import.meta.env.VITE_OAUTH_X_REDIRECT_URL,
    client_id:
      import.meta.env.VITE_OAUTH_X_CLIENT_ID ||
      import.meta.env.VITE_OAUTH_X_CONSUMER_KEY,
    scope: "tweet.read users.read offline.access",
    state: btoa(JSON.stringify(state)),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  };

  return new URLSearchParams(config as Record<string, string>).toString();
};

/* ============================== URL ============================== */

export const getRealtimeWebSocketURL = (endpoint?: string): string => {
  const url = import.meta.env.VITE_REALTIME_WEBSOCKET_URL;
  if (!url) throw new NotezyAPIError(RealtimeError.MissingWebSocketURL());
  const basePath = endpoint ?? CurrentRealtimeBaseURL;
  return `${url.replace(/\/+$/, "")}/${basePath.replace(/^\/+/, "")}`;
};
