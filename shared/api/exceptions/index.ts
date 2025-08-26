import { ZodClass } from "@/util/zodClass";
import { z } from "zod";

/* ============================== Exception Definition ============================== */

export type ExceptionCode = number;
export type ExceptionPrefix = string;

export class NotezyException extends ZodClass({
  code: z.int().positive(),
  prefix: z.string(),
  reason: z.string(),
  message: z.string(),
  status: z.int().positive(),
  details: z.any().optional(),
  error: z.string().optional(),
}) {
  static fromJSON(obj: any): NotezyException {
    return new NotezyException({
      code: obj.code,
      prefix: obj.prefix,
      reason: obj.reason,
      message: obj.message,
      status: obj.status,
      details: obj.details,
      error: obj.error,
    });
  }

  toJSON(): any {
    return {
      code: this.code,
      reason: this.reason,
      prefix: this.prefix,
      message: this.message,
      status: this.status,
      details: this.details,
      // error: this.error
    };
  }

  toString(): string {
    if (this.error) {
      return `[${this.code}]${this.reason}: ${this.error}`;
    }
    return `[${this.code}]${this.reason}: ${this.message}`;
  }

  log(errorMode: boolean = true): this {
    if (errorMode) {
      console.error(
        `[${this.code}]${this.reason}: ${this.message}${
          this.error && `(${this.error})`
        }`
      );
    } else {
      console.log(
        `[${this.code}]${this.reason}: ${this.message}${
          this.error && `(${this.error})`
        }`
      );
    }

    return this;
  }

  equals(
    other: NotezyException,
    withMessage: boolean = false,
    withDetails: boolean = false,
    withError: boolean = false
  ): boolean {
    return (
      this.code === other.code &&
      this.reason === other.reason &&
      this.prefix === other.prefix &&
      (!withMessage || this.message === other.message) &&
      this.status === other.status &&
      (!withDetails || this.details === other.details) &&
      (!withError || this.error === other.error)
    );
  }
}

/* ============================== Error Instance with Exception ============================== */

export class NotezyAPIError extends Error {
  private readonly exception: NotezyException;

  constructor(exception: NotezyException) {
    super(exception.reason);
    this.name = "APIError";
    this.exception = exception;
  }

  get unWrap(): NotezyException {
    return this.exception;
  }
}

/* ============================== Some Reasons and Dictionaries ============================== */

/* 
  ### Note that we only list the Exception with `IsInternal = false` here 
*/

export const DatabaseExceptionReasons = {
  notFound: "NotFound",
  failedToCreate: "FailedToCreate",
  failedToUpdate: "FailedToUpdate",
  failedToDelete: "FailedToDelete",
};
export const APIExceptionReasons = {
  timeout: "Timeout",
};
export const GraphQLExceptionReasons = {};
export const TypeExceptionReasons = {
  invalidDto: "InvalidDto",
};
export const CommonExceptionReasons = {};

export const ExceptionReasonDictionary = {
  auth: {
    ...APIExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
    wrongPassword: "WrongPassword",
    wrongAuthCode: "WrongAuthCode",
    loginBlockedDueToTryingTooManyTimes: "LoginBlockedDueToTryingTooManyTimes",
    authCodeBlockedDueToTryingTooManyTimes:
      "AuthCodeBlockedDueToTryingTooManyTimes",
    permissionDeniedDueToUserRole: "PermissionDeniedDueToUserRole",
    permissionDeniedDueToUserPlan: "PermissionDeniedDueToUserPlan",
    permissionDeniedDueToInvalidRequestOriginDomain:
      "PermissionDeniedDueToInvalidRequestOriginDomain",
    permissionDeniedDueToTooManyRequests:
      "PermissionDeniedDueToTooManyRequests",
  },
  user: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
    duplicateName: "DuplicateName",
    duplicateEmail: "DuplicateEmail",
  },
  userInfo: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  userSetting: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  userAccount: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  usersToBadges: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  theme: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  badge: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
    ...GraphQLExceptionReasons,
    ...TypeExceptionReasons,
    ...CommonExceptionReasons,
  },
  search: {
    ...DatabaseExceptionReasons,
    ...APIExceptionReasons,
  },
  email: {
    ...APIExceptionReasons,
  },
};
