import { CurrentEnvironment } from "@shared/constants/project";
import { ExpirationTimeOfAccessToken } from "@shared/constants/token.constant";
import { CookieKeys } from "@shared/types/cookieKey.type";
import { Environment } from "@shared/types/environment.type";
import { setCookie } from "@tanstack/react-start/server";

export class AccessTokenCookieHandler {
  public static ensure(accessToken?: string) {
    if (accessToken) {
      setCookie(CookieKeys.AccessToken, accessToken, {
        httpOnly: true,
        secure: CurrentEnvironment === Environment.Production,
        sameSite: "lax",
        path: "/",
        maxAge: ExpirationTimeOfAccessToken,
      });
    }
  }

  public static set(accessToken: string) {
    setCookie(CookieKeys.AccessToken, accessToken, {
      httpOnly: true,
      secure: CurrentEnvironment === Environment.Production,
      sameSite: "lax",
      path: "/",
      maxAge: ExpirationTimeOfAccessToken,
    });
  }
}
