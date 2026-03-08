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
