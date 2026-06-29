export enum RoutineTaskPurpose {
  CreateRootShelf = "CreateRootShelf",
  UpdateRootShelf = "UpdateRootShelf",
  ResetRootShelf = "ResetRootShelf",
  CreateSubShelf = "CreateSubShelf",
  UpdateSubShelf = "UpdateSubShelf",
  ResetSubShelf = "ResetSubShelf",
  CreateBlockPack = "CreateBlockPack",
  UpdateBlockPack = "UpdateBlockPack",
  ResetBlockPack = "ResetBlockPack",
  AppendBlock = "AppendBlock",
  UpdateBlock = "UpdateBlock",
  ResetBlock = "ResetBlock",
  CreateRoutine = "CreateRoutine",
  UpdateRoutine = "UpdateRoutine",
}

export const AllRoutineTaskPurposes: RoutineTaskPurpose[] =
  Object.values(RoutineTaskPurpose);
