export enum RoutineTaskStatus {
  Idle = "Idle",
  Waiting = "Waiting",
  Running = "Running",
  Pause = "Pause",
}

export const AllRoutineTaskStatuses: RoutineTaskStatus[] =
  Object.values(RoutineTaskStatus);
