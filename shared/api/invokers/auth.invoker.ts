import { isJsonResponse } from "@/util/isJsonContext";
import { NotezyAPIError, NotezyException } from "@shared/api/exceptions";
import {
  DeleteMeRequest,
  DeleteMeResponse,
  ForgetPasswordRequest,
  ForgetPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  SendAuthCodeRequest,
  SendAuthCodeResponse,
  ValidateEmailRequest,
  ValidateEmailResponse,
} from "@shared/api/interfaces/auth.interface";
import { APIURLPathDictionary, CurrentAPIBaseURL } from "@shared/constants";
import { tKey } from "@shared/translations";

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

  const formattedResponse = (await response.json()) as RegisterResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
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

  const formattedResponse = (await response.json()) as LoginResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
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

  const formattedResponse = (await response.json()) as LogoutResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
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

  const formattedResponse = (await response.json()) as SendAuthCodeResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

export async function ValidateEmail(
  request: ValidateEmailRequest
): Promise<ValidateEmailResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.validateEmail}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
        "X-CSRF-Token": request.header.csrfToken,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const formattedResponse = (await response.json()) as ValidateEmailResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

export async function ResetEmail(
  request: ResetEmailRequest
): Promise<ResetEmailResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.resetEmail}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
        "X-CSRF-Token": request.header.csrfToken,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const formattedResponse = (await response.json()) as ResetEmailResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
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

  const formattedResponse = (await response.json()) as ForgetPasswordResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}

export async function DeleteMe(
  request: DeleteMeRequest
): Promise<DeleteMeResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_DOMAIN_URL}/${CurrentAPIBaseURL}/${APIURLPathDictionary.auth.deleteMe}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.header.userAgent,
        ...(request.header.authorization
          ? { Authorization: request.header.authorization }
          : {}),
        "X-CSRF-Token": request.header.csrfToken,
      },
      body: JSON.stringify(request.body),
      credentials: "include",
    }
  );

  if (!isJsonResponse(response)) {
    throw new Error(tKey.error.encounterUnknownError);
  }

  const formattedResponse = (await response.json()) as DeleteMeResponse;
  if (formattedResponse.exception) {
    throw new NotezyAPIError(new NotezyException(formattedResponse.exception));
  }
  return formattedResponse;
}
