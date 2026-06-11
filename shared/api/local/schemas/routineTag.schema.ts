import { SupportedIcon } from "@shared/api/interfaces/enums";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RoutinesToTags } from "./routinesToTags.schema";
import { UsersToRoutineTags } from "./usersToRoutineTags.schema";

export const RoutineTag = sqliteTable("RoutineTag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default("undefined"),
  color: text("color", { length: 7 }).notNull().default("#FFFFFF"),
  icon: text("icon").$type<SupportedIcon>(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const RoutineTagRelations = relations(RoutineTag, ({ many }) => ({
  usersToRoutineTags: many(UsersToRoutineTags),
  routinesToTags: many(RoutinesToTags),
}));
