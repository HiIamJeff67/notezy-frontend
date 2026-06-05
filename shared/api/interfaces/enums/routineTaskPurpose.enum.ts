export enum RoutineTaskPurpose {
  CreateBlockPack = "CreateBlockPack",
  DeleteBlockPack = "DeleteBlockPack",
  CreateBlock = "CreateBlock",
  UpdateBlock = "UpdateBlock",
  DeleteBlock = "DeleteBlock",
}

export const AllRoutineTaskPurposes: RoutineTaskPurpose[] =
  Object.values(RoutineTaskPurpose);
