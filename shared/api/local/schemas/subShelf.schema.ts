import { BlockPack, RootShelf } from "@shared/api/local/schemas";
import { UUID } from "crypto";
import { isNotNull, relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// the same schemas as the subShelf in api interface
export const SubShelf = sqliteTable(
  "SubShelfTable",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().default("undefined"),
    rootShelfId: text("root_shelf_id")
      .notNull()
      .references(() => RootShelf.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    prevSubShelfId: text("prev_sub_shelf_id"),
    path: text("path", { mode: "json" }).$type<UUID[]>().notNull().default([]), // JSON string, but formed by uuid array
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    uniqueIndex("sub_shelf_unique_idx_name_root_shelf_id_path")
      .on(table.name, table.rootShelfId, table.path)
      .where(isNotNull(table.deletedAt)),
    foreignKey({
      columns: [table.prevSubShelfId],
      foreignColumns: [table.id],
      name: "sub_shelf_fk_prev_sub_shelf_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const SubShelfRelations = relations(SubShelf, ({ one, many }) => ({
  rootShelf: one(RootShelf, {
    fields: [SubShelf.rootShelfId],
    references: [RootShelf.id],
  }),
  prev: one(SubShelf, {
    fields: [SubShelf.prevSubShelfId],
    references: [SubShelf.id],
    relationName: "sub_shelf_relation_prev_next",
  }),
  next: one(SubShelf, {
    fields: [SubShelf.id],
    references: [SubShelf.prevSubShelfId],
    relationName: "sub_shelf_relation_prev_next",
  }),
  blockPacks: many(BlockPack),
}));
