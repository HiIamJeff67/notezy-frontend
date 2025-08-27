import z from "zod";
import { NotezyRequestSchema, NotezyResponseSchema } from "./context.interface";

/* ============================== Request Context ============================== */

export const RegisterRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
  }),
  body: z.object({
    name: z
      .string()
      .min(6)
      .max(16)
      .regex(/^[a-zA-Z0-9]+/),
    email: z.email(),
    password: z
      .string()
      .min(8)
      .max(1024)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
      ),
  }),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    accessToken: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

/* ============================== Login Context ============================== */

export const LoginRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
  }),
  body: z.object({
    account: z.string(),
    password: z
      .string()
      .min(8)
      .max(1024)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
      ),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    accessToken: z.string(),
    updatedAt: z.coerce.date(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/* ============================== Logout Context ============================== */

export const LogoutRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

export const LogoutResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

/* ============================== SendAuthCode Context ============================== */

export const SendAuthCodeRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    email: z.email(),
  }),
});

export type SendAuthCodeRequest = z.infer<typeof SendAuthCodeRequestSchema>;

export const SendAuthCodeResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    authCodeExpiredAt: z.coerce.date(),
    blockAuthCodeUntil: z.coerce.date(),
    updatedAt: z.coerce.date(),
  }),
});

export type SendAuthCodeResponse = z.infer<typeof SendAuthCodeResponseSchema>;

/* ============================== ForgetPassword Context ============================== */

export const ForgetPasswordRequestSchema = NotezyRequestSchema.extend({
  header: z.object({
    userAgent: z.string().min(1),
    authorization: z.string().optional(),
  }),
  body: z.object({
    account: z.string(),
    newPassword: z
      .string()
      .min(8)
      .max(1024)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/
      ),
    authCode: z
      .string()
      .length(6)
      .regex(/^[0-9]+/),
  }),
});

export type ForgetPasswordRequest = z.infer<typeof ForgetPasswordRequestSchema>;

export const ForgetPasswordResponseSchema = NotezyResponseSchema.extend({
  data: z.object({
    updatedAt: z.coerce.date(),
  }),
});

export type ForgetPasswordResponse = z.infer<
  typeof ForgetPasswordResponseSchema
>;
