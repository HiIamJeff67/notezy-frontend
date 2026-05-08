import { SubShelf, User, UsersToShelves } from "@shared/api/local/schemas";
import { isNotNull, relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// the same schemas as the rootShelf in api interface
export const RootShelf = sqliteTable(
  "RootShelfTable",
  {
    id: text("id").primaryKey(),
    ownerPublicId: text("owner_public_id")
      .notNull()
      .references(() => User.publicId, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    name: text("name").notNull().default("undefined"),
    subShelfCount: integer("sub_shelf_count").notNull().default(0),
    itemCount: integer("item_count").notNull().default(0),
    lastAnalyzedAt: integer("last_analyzed_count", {
      mode: "timestamp",
    })
      .notNull()
      .default(new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    uniqueIndex("root_shelf_unique_idx_name_owner_id")
      .on(table.name, table.ownerPublicId)
      .where(isNotNull(table.deletedAt)),
  ]
);

export const RootShelfRelations = relations(RootShelf, ({ one, many }) => ({
  owner: one(User, {
    fields: [RootShelf.ownerPublicId],
    references: [User.publicId],
  }),
  subShelves: many(SubShelf),
  usersToShelves: many(UsersToShelves),
}));
