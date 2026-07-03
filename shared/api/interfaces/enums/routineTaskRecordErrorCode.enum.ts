export enum RoutineTaskRecordErrorCode {
  PermissionDenied = "PermissionDenied",
  PayloadInvalid = "PayloadInvalid",
  TargetNotFound = "TargetNotFound",
  PlanLimitExceeded = "PlanLimitExceeded",
  HandlerFailed = "HandlerFailed",
  DatabaseError = "DatabaseError",
  Timeout = "Timeout",
  Canceled = "Canceled",
  Unknown = "Unknown",
}

export const AllRoutineTaskRecordErrorCodes: RoutineTaskRecordErrorCode[] =
  Object.values(RoutineTaskRecordErrorCode);
