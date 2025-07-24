import { getEnvironmentVariable } from "@/lib/getEnvironmentVariable";
import {
  APIURLPathDictionary,
  CurrentAPIBaseURL,
} from "@/shared/constants/url.constant";
import { NotezyRequest, NotezyResponse } from "./form.api";

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

export async function Login(
  request: LoginRequest
): Promise<LoginResponse | null> {
  const response = await fetch(
    `${getEnvironmentVariable("NEXT_PUBLIC_API_DOMAIN_URL")}/
      ${CurrentAPIBaseURL}/
      ${APIURLPathDictionary.auth.login}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();
  return data as LoginResponse;
}

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
): Promise<RegisterResponse | null> {
  const response = await fetch(
    `${getEnvironmentVariable("NEXT_PUBLIC_API_DOMAIN_URL")}/
       ${CurrentAPIBaseURL}/
       ${APIURLPathDictionary.auth.register}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();
  return data as RegisterResponse;
}

/* ========================= Logout ========================= */
export async function Logout() {}
