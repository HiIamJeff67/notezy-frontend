import {
  ExceptionCode,
  ExceptionPrefix,
  NotezyException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";
import {
  APIExceptionReasons,
  DatabaseExceptionReasons,
  TypeExceptionReasons,
} from ".";

// Note: The definitions of structures and types are in the "src/shared/types/apiException.type.ts"

/* ============================== Exception Field Type Definitions ============================== */
export const ExceptionSubDomainCodeShiftAmount = 100000;
export const MaxExceptionCode = 99999999;
export const MinExceptionCode = 0;
export const ReservedExceptionCode = 100;

/* ============================== Helper Functions of Exceptions ============================== */
export function IsExceptionCode(exceptionCode: ExceptionCode): boolean {
  return exceptionCode >= MinExceptionCode && exceptionCode <= MaxExceptionCode;
}

/* ============================== General Exceptions Definitions ============================== */
export class DatabaseException {
  protected BaseCode: ExceptionCode;
  protected Prefix: ExceptionPrefix;

  constructor(baseCode: ExceptionCode, prefix: ExceptionPrefix) {
    this.BaseCode = baseCode;
    this.Prefix = prefix;
  }

  NotFound(): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.notFound,
      message: `${this.Prefix} Not found`,
      status: StatusCodes.NOT_FOUND,
    });
  }

  FailedToCreate(): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.failedToCreate,
      message: `Failed to create ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  FailedToUpdate(): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 3,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.failedToUpdate,
      message: `Failed to update ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  FailedToDelete(): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 4,
      prefix: this.Prefix,
      reason: DatabaseExceptionReasons.failedToDelete,
      message: `Failed to delete ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}

export class APIException {
  protected BaseCode: ExceptionCode;
  protected Prefix: ExceptionPrefix;

  constructor(baseCode: ExceptionCode, prefix: ExceptionPrefix) {
    this.BaseCode = baseCode;
    this.Prefix = prefix;
  }

  Timeout(time: number = 0): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 12,
      prefix: this.Prefix,
      reason: APIExceptionReasons.timeout,
      message: `Timeout in ${this.Prefix} with ${time}`,
      status: StatusCodes.REQUEST_TIMEOUT,
    });
  }
}

export class GraphQLException {
  protected BaseCode: ExceptionCode;
  protected Prefix: ExceptionPrefix;

  constructor(baseCode: ExceptionCode, prefix: ExceptionPrefix) {
    this.BaseCode = baseCode;
    this.Prefix = prefix;
  }
}

export class TypeException {
  protected BaseCode: ExceptionCode;
  protected Prefix: ExceptionPrefix;

  constructor(baseCode: ExceptionCode, prefix: ExceptionPrefix) {
    this.BaseCode = baseCode;
    this.Prefix = prefix;
  }
}

export class CommonException {
  protected BaseCode: ExceptionCode;
  protected Prefix: ExceptionPrefix;

  constructor(baseCode: ExceptionCode, prefix: ExceptionPrefix) {
    this.BaseCode = baseCode;
    this.Prefix = prefix;
  }

  InvalidDto(): NotezyException {
    return new NotezyException({
      code: this.BaseCode + 32,
      prefix: this.Prefix,
      reason: TypeExceptionReasons.invalidDto,
      message: `Invalid dto detected in ${this.Prefix}`,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
}
