import {
  AccessControlPermission,
  SupportedIcon,
} from "@shared/api/interfaces/enums";
import { UUID } from "crypto";
import { RoutineMeta } from "./routineMeta.type";

export interface StationMeta {
  id: UUID;
  name: string;
  description: string;
  icon: SupportedIcon | null;
  headerBackgroundURL: string | null;
  permission: AccessControlPermission;
  routineCount: number;
  deletedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
  routines: RoutineMeta[];
}

export const getDefaultStationMeta = (stationId: UUID): StationMeta => ({
  id: stationId,
  name: "Untitled",
  description: "",
  icon: null,
  headerBackgroundURL: null,
  permission: AccessControlPermission.Read,
  routineCount: 0,
  deletedAt: null,
  updatedAt: new Date(),
  createdAt: new Date(),
  routines: [],
});
