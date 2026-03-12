import { RedirectState } from "@shared/types/redirectState.type";

export const getOAuthGoogleSearchParamsString = (
  state: RedirectState
): string => {
  const config = {
    redirect_uri: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_REDIRECT_URL,
    client_id: process.env.NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID,
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
    redirect_uri: process.env.NEXT_PUBLIC_OAUTH_X_REDIRECT_URL,
    client_id: process.env.NEXT_PUBLIC_OAUTH_X_CLIENT_ID,
    scope: "tweet.read users.read offline.access",
    state: btoa(JSON.stringify(state)),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  };

  return new URLSearchParams(config as Record<string, string>).toString();
};
