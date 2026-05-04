import { Mode } from "@shared/constants/projectManagement.constant";
import { ExpirationTimeOfRefreshToken } from "@shared/constants/token.constant";
import { CookieKeys } from "@shared/types/cookieKey.type";
import { ModeType } from "@shared/types/modeType.type";
import { setCookie } from "@tanstack/react-start/server";

export class RefreshTokenCookieHandler {
  public static ensure(refreshToken?: string) {
    if (refreshToken) {
      setCookie(CookieKeys.RefreshToken, refreshToken, {
        httpOnly: true,
        secure: Mode === ModeType.Production,
        sameSite: "strict",
        path: "/",
        maxAge: ExpirationTimeOfRefreshToken,
      });
    }
  }

  public static set(refreshToken: string) {
    setCookie(CookieKeys.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: Mode === ModeType.Production,
      sameSite: "strict",
      path: "/",
      maxAge: ExpirationTimeOfRefreshToken,
    });
  }
}
