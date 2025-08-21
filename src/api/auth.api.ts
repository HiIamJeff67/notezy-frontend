import { isJsonResponse } from "@/util/isJsonContext";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";
import { NotezyRequest, NotezyResponse } from "@shared/types/context.type";
import { ExceptionReasonDictionary } from "./exceptions";

/* ========================= Register ========================= */
export interface RegisterRequest extends NotezyRequest {
  header: {
    userAgent: string;
  };
  body: {
    name: string;
    email: string;
    password: string;
  };
}

export interface RegisterResponse extends NotezyResponse {
  data: {
    accessToken: string;
    createdAt: Date;
  };
}

export async function Register(
  request: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.register}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as RegisterResponse;
  if (jsonResponse.exception) {
    switch (jsonResponse.exception.reason) {
      case ExceptionReasonDictionary.user.duplicateName:
        throw new Error(tKey.error.apiError.register.duplicateName);
      case ExceptionReasonDictionary.user.duplicateEmail:
        throw new Error(tKey.error.apiError.register.duplicateEmail);
      default:
        throw new Error(jsonResponse.exception.message);
    }
  }
  return jsonResponse;
}

/* ========================= Login ========================= */
export interface LoginRequest extends NotezyRequest {
  header: {
    userAgent: string;
  };
  body: {
    account: string;
    password: string;
  };
}

export interface LoginResponse extends NotezyResponse {
  data: {
    accessToken: string;
    createdAt: Date;
  };
}

export async function Login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.login}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as LoginResponse;
  if (jsonResponse.exception) {
    switch (jsonResponse.exception.reason) {
      case ExceptionReasonDictionary.user.notFound:
        throw new Error(tKey.error.apiError.getUser.failedToGetUser);
      default:
        throw new Error(jsonResponse.exception.message);
    }
  }
  return jsonResponse;
}

/* ========================= Logout ========================= */
export interface LogoutRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
}

export interface LogoutResponse extends NotezyResponse {
  data: {
    updatedAt: Date;
  };
}

export async function Logout(request: LogoutRequest): Promise<LogoutResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.logout}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
      },
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as LogoutResponse;
  if (jsonResponse.exception) {
    throw new Error(jsonResponse.exception.message);
  }
  return jsonResponse;
}

/* ============================== SendAuthCode ============================== */
export interface SendAuthCodeRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
  body: {
    email: string;
  };
}

export interface SendAuthCodeResponse extends NotezyResponse {
  data: {
    authCodeExpiredAt: Date;
    blockAuthCodeUntil: Date;
    updatedAt: Date;
  };
}

export async function SendAuthCode(
  request: SendAuthCodeRequest
): Promise<SendAuthCodeResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.sendAuthCode}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as SendAuthCodeResponse;
  if (jsonResponse.exception) {
    switch (jsonResponse.exception.reason) {
      case ExceptionReasonDictionary.user.notFound:
        throw new Error(tKey.error.apiError.getUser.failedToGetUser);
      default:
        throw new Error(jsonResponse.exception.message);
    }
  }
  return jsonResponse;
}

/* ============================== ForgetPassword ============================== */
export interface ForgetPasswordRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization?: string;
  };
  body: {
    account: string;
    newPassword: string;
    authCode: string;
  };
}

export interface ForgetPasswordResponse extends NotezyResponse {
  data: {
    updatedAt: Date;
  };
}

export async function ForgetPassword(
  request: ForgetPasswordRequest
): Promise<ForgetPasswordResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.forgetPassword}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const jsonResponse = (await response.json()) as ForgetPasswordResponse;
  if (jsonResponse.exception) {
    switch (jsonResponse.exception.reason) {
      case ExceptionReasonDictionary.user.notFound:
        throw new Error(tKey.error.apiError.getUser.failedToGetUser);
      default:
        throw new Error(jsonResponse.exception.message);
    }
  }
  return jsonResponse;
}
