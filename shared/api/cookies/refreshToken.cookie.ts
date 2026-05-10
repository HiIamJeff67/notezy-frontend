import { CurrentEnvironment } from "@shared/constants/project";
import { ExpirationTimeOfRefreshToken } from "@shared/constants/token.constant";
import { CookieKeys } from "@shared/types/cookieKey.type";
import { Environment } from "@shared/types/environment.type";
import { setCookie } from "@tanstack/react-start/server";

export class RefreshTokenCookieHandler {
  public static ensure(refreshToken?: string) {
    if (refreshToken) {
      setCookie(CookieKeys.RefreshToken, refreshToken, {
        httpOnly: true,
        secure: CurrentEnvironment === Environment.Production,
        sameSite: "strict",
        path: "/",
        maxAge: ExpirationTimeOfRefreshToken,
      });
    }
  }

  public static set(refreshToken: string) {
    setCookie(CookieKeys.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: CurrentEnvironment === Environment.Production,
      sameSite: "strict",
      path: "/",
      maxAge: ExpirationTimeOfRefreshToken,
    });
  }
}
