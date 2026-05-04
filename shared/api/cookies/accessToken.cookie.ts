import { Mode } from "@shared/constants/projectManagement.constant";
import { ExpirationTimeOfAccessToken } from "@shared/constants/token.constant";
import { CookieKeys } from "@shared/types/cookieKey.type";
import { ModeType } from "@shared/types/modeType.type";
import { setCookie } from "@tanstack/react-start/server";

export class AccessTokenCookieHandler {
  public static ensure(accessToken?: string) {
    if (accessToken) {
      setCookie(CookieKeys.AccessToken, accessToken, {
        httpOnly: true,
        secure: Mode === ModeType.Production,
        sameSite: "lax",
        path: "/",
        maxAge: ExpirationTimeOfAccessToken,
      });
    }
  }

  public static set(accessToken: string) {
    setCookie(CookieKeys.AccessToken, accessToken, {
      httpOnly: true,
      secure: Mode === ModeType.Production,
      sameSite: "lax",
      path: "/",
      maxAge: ExpirationTimeOfAccessToken,
    });
  }
}
