import {
  RoutineTaskPurpose,
  RoutineTaskStatus,
} from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RoutinesToTasks } from "./routinesToTasks.schema";
import { Station } from "./station.schema";

export const RoutineTask = sqliteTable("RoutineTaskTable", {
  id: text("id").primaryKey(),
  stationId: text("station_id")
    .notNull()
    .references(() => Station.id),
  title: text("title").notNull().default("undefined"),
  purpose: text("purpose").$type<RoutineTaskPurpose>().notNull(),
  payload: text("payload", { mode: "json" }).$type<unknown>().notNull(),
  priority: integer("priority").notNull().default(0),
  status: text("status")
    .$type<RoutineTaskStatus>()
    .notNull()
    .default(RoutineTaskStatus.Idle),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(1),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  actualStartedAt: integer("actual_started_at", { mode: "timestamp" }),
  actualEndedAt: integer("actual_ended_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const RoutineTaskRelations = relations(RoutineTask, ({ one, many }) => ({
  station: one(Station, {
    fields: [RoutineTask.stationId],
    references: [Station.id],
  }),
  routinesToTasks: many(RoutinesToTasks),
}));
