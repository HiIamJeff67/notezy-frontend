import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Routine } from "./routine.schema";
import { RoutineTag } from "./routineTag.schema";

export const RoutinesToTags = sqliteTable("RoutinesToTags", {
  routineId: text("routine_id")
    .notNull()
    .references(() => Routine.id),
  tagId: text("tag_id")
    .notNull()
    .references(() => RoutineTag.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const RoutinesToTagsRelations = relations(RoutinesToTags, ({ one }) => ({
  routine: one(Routine, {
    fields: [RoutinesToTags.routineId],
    references: [Routine.id],
  }),
  tag: one(RoutineTag, {
    fields: [RoutinesToTags.tagId],
    references: [RoutineTag.id],
  }),
}));
