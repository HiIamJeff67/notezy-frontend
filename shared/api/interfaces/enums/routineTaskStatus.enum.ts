export enum RoutineTaskStatus {
  Idle = "Idle",
  Waiting = "Waiting",
  Running = "Running",
  Pause = "Pause",
  Cancel = "Cancel",
  Success = "Success",
  Fail = "Fail",
}

export const AllRoutineTaskStatuses: RoutineTaskStatus[] =
  Object.values(RoutineTaskStatus);
