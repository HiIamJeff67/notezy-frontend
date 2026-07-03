export enum RoutineTaskRecordStatus {
  Running = "Running",
  Success = "Success",
  Failed = "Failed",
  Cancel = "Cancel",
}

export const AllRoutineTaskRecordStatuses: RoutineTaskRecordStatus[] =
  Object.values(RoutineTaskRecordStatus);
