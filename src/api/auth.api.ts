/* ========================= Login ========================= */
export interface LoginReqDto {
  account: string;
  password: string;
  userAgent: string;
}

export interface LoginResDto {
  accessToken: string;
}

export async function Login(dto: LoginReqDto): Promise<LoginResDto | null> {
  try {
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/* ========================= Register ========================= */

export async function Register() {}

/* ========================= Logout ========================= */
export async function Logout() {}
