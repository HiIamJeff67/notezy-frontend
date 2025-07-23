import { Response } from "./form.api";

/* ========================= Login ========================= */
export interface LoginRequest {
  account: string;
  password: string;
  userAgent: string;
}

export interface LoginResponse {
  accessToken: string;
}

export async function Login(
  request: LoginRequest
): Promise<LoginResponse | null> {
  try {
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/* ========================= Register ========================= */

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  userAgent: string;
}

export interface RegisterResponse extends Response {
  data: {
    accessToken: string;
    createdAt: Date;
  };
}

export async function Register(
  request: RegisterRequest
): Promise<RegisterResponse | null> {
  try {
    const response = await fetch(
      "http://localhost:7777/api/development/v1/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": request.userAgent,
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();
    return data as RegisterResponse;
  } catch (error) {
    throw error;
  }
}

/* ========================= Logout ========================= */
export async function Logout() {}
