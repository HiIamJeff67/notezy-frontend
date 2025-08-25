import {
  ExceptionCode,
  ExceptionPrefix,
  NotezyException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";
import { ExceptionReasonDictionary } from ".";
import {
  DatabaseException,
  ExceptionSubDomainCodeShiftAmount,
} from "./database.exception";

const AuthExceptionSubDomainCode: ExceptionCode = 31;
const ExceptionBaseCode_Auth: ExceptionCode =
  AuthExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_Auth: ExceptionPrefix = "Auth";

export class AuthExceptions extends DatabaseException {
  BaseCode: ExceptionCode;
  Prefix: ExceptionPrefix;

  constructor() {
    super(AuthExceptionSubDomainCode, ExceptionPrefix_Auth);
    this.BaseCode = ExceptionBaseCode_Auth;
    this.Prefix = ExceptionPrefix_Auth;
  }

  WrongPassword = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.wrongPassword,
      message: "The password is not match",
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  WrongAuthCode = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 5,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.wrongAuthCode,
      message: "The authentication code is not match",
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  LoginBlockedDueToTryingTooManyTimes = (
    blockUntil: Date = new Date()
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 8,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth.loginBlockedDueToTryingTooManyTimes,
      message: `Blocked the login procedure because user has tried too many times and require to wait until ${blockUntil}`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  AuthCodeBlockedDueToTryingTooManyTimes = (
    blockUntil: Date = new Date()
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 9,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth.authCodeBlockedDueToTryingTooManyTimes,
      message: `Blocked the generating auth code procedure because user has tried too many times and require to wait until ${blockUntil}`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  PermissionDeniedDueToUserRole = (
    userRole: any = "FAKE_USER_ROLE"
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 101,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.permissionDeniedDueToUserRole,
      message: `The current user role of ${userRole} does not have access to this operation`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  PermissionDeniedDueToUserPlan = (
    userPlan: any = "FAKE_USER_PLAN"
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 102,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.auth.permissionDeniedDueToUserPlan,
      message: `The current user plan of ${userPlan} does not have access to this operation`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  PermissionDeniedDueToInvalidRequestOriginDomain = (
    origin: any = "FAKE_ORIGIN"
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 103,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth
          .permissionDeniedDueToInvalidRequestOriginDomain,
      message: `The current request origin domain of ${origin} is invalid`,
      status: StatusCodes.UNAUTHORIZED,
    });
  };

  PermissionDeniedDueToTooManyRequests = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 104,
      prefix: this.Prefix,
      reason:
        ExceptionReasonDictionary.auth.permissionDeniedDueToTooManyRequests,
      message: "Too many requests, please wait for a while",
      status: StatusCodes.UNAUTHORIZED,
    });
  };
}
