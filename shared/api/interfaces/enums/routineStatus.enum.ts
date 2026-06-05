export enum RoutineStatus {
  Scheduled = "Scheduled",
  InProgress = "InProgress",
  Completed = "Completed",
  OverDue = "OverDue",
}

export const AllRoutineStatuses: RoutineStatus[] = Object.values(RoutineStatus);
