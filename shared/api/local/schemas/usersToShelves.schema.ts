import { RootShelf } from "@shared/api/local/schemas/rootShelf.schema";
import { User } from "@shared/api/local/schemas/user.schema";
import { eq, relations } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const UsersToShelves = sqliteTable(
  "UsersToShelvesTable",
  {
    ownerPublicId: text("owner_public_id")
      .notNull()
      .references(() => User.publicId),
    rootShelfId: text("root_shelf_id")
      .notNull()
      .references(() => RootShelf.id),
    permission: text("permission"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    primaryKey({ columns: [table.ownerPublicId, table.rootShelfId] }),
    uniqueIndex("users_to_shelves_unique_idx_root_shelf_owner")
      .on(table.rootShelfId)
      .where(eq(table.permission, "Owner")),
  ]
);

export const UsersToShelvesRelations = relations(UsersToShelves, ({ one }) => ({
  user: one(User, {
    fields: [UsersToShelves.ownerPublicId],
    references: [User.publicId],
  }),
  rootShelf: one(RootShelf, {
    fields: [UsersToShelves.rootShelfId],
    references: [RootShelf.id],
  }),
}));
