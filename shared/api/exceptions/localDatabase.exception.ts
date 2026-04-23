import { StatusCodes } from "http-status-codes";
import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  NotezyException,
} from ".";
import { ExceptionSubDomainCodeShiftAmount } from "./database.exception";

const LocalDatabaseExceptionSubDomainCode: ExceptionCode = 991;
const ExceptionBaseCode_LocalDatabase: ExceptionCode =
  LocalDatabaseExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_LocalDatabase: ExceptionPrefix = "LocalDatabase";

export class LocalDatabaseExceptions {
  static BaseCode: ExceptionCode = ExceptionBaseCode_LocalDatabase;
  static Prefix: ExceptionPrefix = ExceptionPrefix_LocalDatabase;

  static LocalDatabaseUnavailable = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.localDatabase.localDatabaseUnavailable,
      message: "Local database unavailable, please contact us",
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };

  static FailedInQueryFunction = (
    queryFunctionName: string
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.localDatabase.failedInQueryFunction,
      message: "Failed in query function: " + queryFunctionName,
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };

  static FailedInMutationFunction = (
    mutationFunctionName: string
  ): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 3,
      prefix: ExceptionReasonDictionary.localDatabase.failedInMutationFunction,
      message: "Failed in mutation function: " + mutationFunctionName,
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };
}
