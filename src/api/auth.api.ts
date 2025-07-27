import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@/shared/constants/url.constant";
import { tKey } from "@/shared/translations";
import { NotezyRequest, NotezyResponse } from "./form.api";

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

  const data = (await response.json()) as RegisterResponse;
  if (data.exception !== null) {
    switch (data.exception.reason) {
      case "DuplicateName":
        throw new Error(tKey.error.apiError.register.duplicateName);
      case "DuplicateEmail":
        throw new Error(tKey.error.apiError.register.duplicateEmail);
      default:
        throw new Error(data.exception.message);
    }
  }
  return data;
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

  const data = (await response.json()) as LoginResponse;
  if (data.exception !== null) {
    throw new Error(data.exception.message);
  }
  return data;
}

/* ========================= Logout ========================= */
export interface LogoutRequest extends NotezyRequest {
  header: {
    userAgent: string;
    authorization: string | undefined;
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

  const data = (await response.json()) as LogoutResponse;
  if (data.exception !== null) {
    throw new Error(data.exception.message);
  }
  return data;
}
