import { StatusCodes } from "http-status-codes";
import {
  ExceptionCode,
  ExceptionPrefix,
  ExceptionReasonDictionary,
  NotezyException,
} from ".";
import { ExceptionSubDomainCodeShiftAmount } from "./database.exception";

const ClientExceptionSubDomainCode: ExceptionCode = 990;
const ExceptionBaseCode_Client: ExceptionCode =
  ClientExceptionSubDomainCode * ExceptionSubDomainCodeShiftAmount;
const ExceptionPrefix_Client: ExceptionPrefix = "Client";

export class ClientCommonExceptions {
  static BaseCode: ExceptionCode = ExceptionBaseCode_Client;
  static Prefix: ExceptionPrefix = ExceptionPrefix_Client;

  static NetworkRequired = (): NotezyException => {
    return new NotezyException({
      code: this.BaseCode + 1,
      prefix: this.Prefix,
      reason: ExceptionReasonDictionary.client.networkRequired,
      message: "Network is required",
      status: StatusCodes.SERVICE_UNAVAILABLE,
    });
  };
}
