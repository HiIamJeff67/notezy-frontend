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

const UserExceptionSubDomainCode: ExceptionCode = 31;
const ExceptionBaseCode_User: ExceptionCode =
  UserExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_User: ExceptionPrefix = "User";

export class UserExceptions extends DatabaseException {
  BaseCode: ExceptionCode;
  Prefix: ExceptionPrefix;

  constructor() {
    super(UserExceptionSubDomainCode, ExceptionPrefix_User);
    this.BaseCode = ExceptionBaseCode_User;
    this.Prefix = ExceptionPrefix_User;
  }

  DuplicateName(name: string = "FAKE_NAME"): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.user.duplicateName,
      message: `The name of ${name} is already be used`,
      status: StatusCodes.CONFLICT,
    });
  }

  DuplicateEmail(email: string = "FAKE_EMAIL"): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.user.duplicateEmail,
      message: `The email of ${email} is already be used`,
      status: StatusCodes.CONFLICT,
    });
  }
}
