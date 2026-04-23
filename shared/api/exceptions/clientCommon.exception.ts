import { StatusCodes } from "http-status-codes";
import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  NotezyException,
} from ".";
import { ExceptionSubDomainCodeShiftAmount } from "./database.exception";

const ClientCommonEExceptionSubDomainCode: ExceptionCode = 990;
const ExceptionBaseCode_ClientCommonE: ExceptionCode =
  ClientCommonEExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_ClientCommonE: ExceptionPrefix = "ClientCommonE";

export class ClientCommonExceptions {
  static BaseCode: ExceptionCode = ExceptionBaseCode_ClientCommonE;
  static Prefix: ExceptionPrefix = ExceptionPrefix_ClientCommonE;

  static NetworkRequired = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.clientCommon.networkRequired,
      message: "Network is required",
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };
}
