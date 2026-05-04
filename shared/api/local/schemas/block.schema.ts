import {
  foreignKey,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { blockGroup } from "./blockGroup.schema";

export const block = sqliteTable(
  "BlockTable",
  {
    id: text("id").primaryKey(),
    parentBlockId: text("parent_block_id"),
    blockGroupId: text("block_group_id")
      .notNull()
      .references(() => blockGroup.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
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
  },
  table => [
    foreignKey({
      columns: [table.parentBlockId],
      foreignColumns: [table.id],
      name: "block_fk_parent_block_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);
