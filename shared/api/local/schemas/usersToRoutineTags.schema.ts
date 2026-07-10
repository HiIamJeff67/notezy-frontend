import { AccessControlPermission } from "@shared/api/interfaces/enums";
import { eq, relations } from "drizzle-orm";
import {
  integer,
  index,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { RoutineTag } from "./routineTag.schema";
import { User } from "./user.schema";

export const UsersToRoutineTags = sqliteTable(
  "UsersToTagsTable",
  {
    userPublicId: text("user_public_id")
      .notNull()
      .references(() => User.publicId),
    tagId: text("tag_id")
      .notNull()
      .references(() => RoutineTag.id),
    permission: text("permission").$type<AccessControlPermission>(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    index("users_to_routine_tags_tag_idx").on(table.tagId),
    primaryKey({ columns: [table.userPublicId, table.tagId] }),
    uniqueIndex("users_to_routine_tags_unique_idx_routine_owner")
      .on(table.tagId)
      .where(eq(table.permission, AccessControlPermission.Owner)),
  ]
);

export const UsersToRoutineTagsRelations = relations(
  UsersToRoutineTags,
  ({ one }) => ({
    user: one(User, {
      fields: [UsersToRoutineTags.userPublicId],
      references: [User.publicId],
    }),
    routineTag: one(RoutineTag, {
      fields: [UsersToRoutineTags.tagId],
      references: [RoutineTag.id],
    }),
  })
);
