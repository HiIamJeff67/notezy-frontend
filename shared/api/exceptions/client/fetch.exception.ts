import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  ExceptionSubDomainCodeShiftAmount,
  NotezyException,
} from "@shared/api/exceptions";
import { StatusCodes } from "http-status-codes";

const FetchClientExceptionDomainCode: ExceptionCode = 990;
const ClientExceptionBaseCode_Fetch: ExceptionCode =
  FetchClientExceptionDomainCode * ExceptionSubDomainCodeShiftAmount;
const ClientExceptionPrefix_Fetch: ExceptionPrefix = "Fetch";

export class FetchClientExceptions {
  static BaseCode: ExceptionCode = ClientExceptionBaseCode_Fetch;
  static Prefix: ExceptionPrefix = ClientExceptionPrefix_Fetch;

  // an unfallbackable network error
  static NetworkRequired = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.fetch.networkRequired,
      message: "Network is required",
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };

  // a fallbackable network error which can be handled with some other logic
  static MissingNetwork = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 2,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.fetch.missingNetwork,
      message: "Network is missing, fallback to undergoing procedures",
      status: StatusCodes.BAD_GATEWAY,
    });
  };

  // an undefined error enforce the client to accept and handle
  static UndefinedError = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 3,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.fetch.undefinedError,
      message: "Undefined error occurred",
      status: StatusCodes.FORBIDDEN,
    });
  };
}
