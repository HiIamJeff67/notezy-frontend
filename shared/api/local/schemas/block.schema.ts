import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const block = sqliteTable("BlockTable", {
  id: text("id").primaryKey(),
  parentBlockId: text("parent_block_id"),
  blockGroupId: text("block_group_id").notNull(),
  type: text("type").notNull().default("paragraph"),
  props: text("props").notNull().default("{}"),
  content: text("content").notNull().default("[]"),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
