import {
  ExceptionCode,
  ExceptionPrefix,
  NotezyException,
} from "@shared/types/apiException.type";
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
    return new NotezyException(
      this.BaseCode + 1,
      this.Prefix,
      DatabaseExceptionReasons.notFound,
      `${this.Prefix} Not found`,
      StatusCodes.NOT_FOUND
    );
  }

  FailedToCreate(): NotezyException {
    return new NotezyException(
      this.BaseCode + 2,
      this.Prefix,
      DatabaseExceptionReasons.failedToCreate,
      `Failed to create ${this.Prefix}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  FailedToUpdate(): NotezyException {
    return new NotezyException(
      this.BaseCode + 3,
      this.Prefix,
      DatabaseExceptionReasons.failedToUpdate,
      `Failed to update ${this.Prefix}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  FailedToDelete(): NotezyException {
    return new NotezyException(
      this.BaseCode + 4,
      this.Prefix,
      DatabaseExceptionReasons.failedToDelete,
      `Failed to delete ${this.Prefix}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
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
    return new NotezyException(
      this.BaseCode + 12,
      this.Prefix,
      APIExceptionReasons.timeout,
      `Timeout in ${this.Prefix} with ${time}`,
      StatusCodes.REQUEST_TIMEOUT
    );
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
    return new NotezyException(
      this.BaseCode + 32,
      this.Prefix,
      TypeExceptionReasons.invalidDto,
      `Invalid dto detected in ${this.Prefix}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
