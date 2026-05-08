import { BlockGroup } from "@shared/api/local/schemas";
import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const Block = sqliteTable(
  "BlockTable",
  {
    id: text("id").primaryKey(),
    parentBlockId: text("parent_block_id"),
    blockGroupId: text("block_group_id")
      .notNull()
      .references(() => BlockGroup.id, {
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

export const BlockRelations = relations(Block, ({ one, many }) => ({
  parent: one(Block, {
    fields: [Block.parentBlockId],
    references: [Block.id],
    relationName: "block_relation_parent_children",
  }),
  children: many(Block, {
    relationName: "block_relation_parent_children",
  }),
  blockGroup: one(BlockGroup, {
    fields: [Block.blockGroupId],
    references: [BlockGroup.id],
  }),
}));
