import {
  ExceptionCode,
  ExceptionPrefix,
  NotezyException,
} from "@/shared/types/apiException.type";
import { StatusCodes } from "http-status-codes";
import { ExceptionReasonDictionary } from ".";
import {
  DatabaseException,
  ExceptionSubDomainCodeShiftAmount,
} from "./exceptions";

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
    return new NotezyException(
      this.BaseCode + 1,
      this.Prefix,
      ExceptionReasonDictionary.user.duplicateName,
      `The name of ${name} is already be used`,
      StatusCodes.CONFLICT
    );
  }

  DuplicateEmail(email: string = "FAKE_EMAIL"): NotezyException {
    return new NotezyException(
      this.BaseCode + 2,
      this.Prefix,
      ExceptionReasonDictionary.user.duplicateEmail,
      `The email of ${email} is already be used`,
      StatusCodes.CONFLICT
    );
  }
}
