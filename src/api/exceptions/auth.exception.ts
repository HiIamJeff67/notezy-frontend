import {
  ExceptionCode,
  ExceptionPrefix,
  NotezyException,
} from "@shared/types/apiException.type";
import { StatusCodes } from "http-status-codes";
import { ExceptionReasonDictionary } from ".";
import {
  DatabaseException,
  ExceptionSubDomainCodeShiftAmount,
} from "./exceptions";

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
    return new NotezyException(
      this.BaseCode + 1,
      this.Prefix,
      ExceptionReasonDictionary.auth.wrongPassword,
      "The password is not match",
      StatusCodes.UNAUTHORIZED
    );
  };

  WrongAuthCode = (): NotezyException => {
    return new NotezyException(
      this.BaseCode + 5,
      this.Prefix,
      ExceptionReasonDictionary.auth.wrongAuthCode,
      "The authentication code is not match",
      StatusCodes.UNAUTHORIZED
    );
  };

  LoginBlockedDueToTryingTooManyTimes = (
    blockUntil: Date = new Date()
  ): NotezyException => {
    return new NotezyException(
      this.BaseCode + 8,
      this.Prefix,
      ExceptionReasonDictionary.auth.loginBlockedDueToTryingTooManyTimes,
      `Blocked the login procedure because user has tried too many times and require to wait until ${blockUntil}`,
      StatusCodes.UNAUTHORIZED
    );
  };

  AuthCodeBlockedDueToTryingTooManyTimes = (
    blockUntil: Date = new Date()
  ): NotezyException => {
    return new NotezyException(
      this.BaseCode + 9,
      this.Prefix,
      ExceptionReasonDictionary.auth.authCodeBlockedDueToTryingTooManyTimes,
      `Blocked the generating auth code procedure because user has tried too many times and require to wait until ${blockUntil}`,
      StatusCodes.UNAUTHORIZED
    );
  };

  PermissionDeniedDueToUserRole = (
    userRole: any = "FAKE_USER_ROLE"
  ): NotezyException => {
    return new NotezyException(
      this.BaseCode + 101,
      this.Prefix,
      ExceptionReasonDictionary.auth.permissionDeniedDueToUserRole,
      `The current user role of ${userRole} does not have access to this operation`,
      StatusCodes.UNAUTHORIZED
    );
  };

  PermissionDeniedDueToUserPlan = (
    userPlan: any = "FAKE_USER_PLAN"
  ): NotezyException => {
    return new NotezyException(
      this.BaseCode + 102,
      this.Prefix,
      ExceptionReasonDictionary.auth.permissionDeniedDueToUserPlan,
      `The current user plan of ${userPlan} does not have access to this operation`,
      StatusCodes.UNAUTHORIZED
    );
  };

  PermissionDeniedDueToInvalidRequestOriginDomain = (
    origin: any = "FAKE_ORIGIN"
  ): NotezyException => {
    return new NotezyException(
      this.BaseCode + 103,
      this.Prefix,
      ExceptionReasonDictionary.auth.permissionDeniedDueToInvalidRequestOriginDomain,
      `The current request origin domain of ${origin} is invalid`,
      StatusCodes.UNAUTHORIZED
    );
  };

  PermissionDeniedDueToTooManyRequests = (): NotezyException => {
    return new NotezyException(
      this.BaseCode + 104,
      this.Prefix,
      ExceptionReasonDictionary.auth.permissionDeniedDueToTooManyRequests,
      "Too many requests, please wait for a while",
      StatusCodes.UNAUTHORIZED
    );
  };
}
