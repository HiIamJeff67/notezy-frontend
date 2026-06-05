import { SupportedIcon } from "@shared/api/interfaces/enums";
import { UUID } from "crypto";
import { RoutineMeta } from "./routineMeta.type";

export interface RoutineTagMeta {
  id: UUID;
  name: string;
  color: string;
  icon: SupportedIcon | null;
  updatedAt: Date;
  createdAt: Date;
  routines: RoutineMeta[];
}

export const getDefaultRoutineTagMeta = (
  routineTagId: UUID
): RoutineTagMeta => ({
  id: routineTagId,
  name: "Undefined",
  color: "#000000",
  icon: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  routines: [],
});
