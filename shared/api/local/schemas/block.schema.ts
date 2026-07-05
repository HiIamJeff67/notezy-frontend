import { BlockPack } from "@shared/api/local/schemas";
import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { JSONType } from "zod";

export const Block = sqliteTable(
  "BlockTable",
  {
    id: text("id").primaryKey(),
    blockPackId: text("block_pack_id")
      .notNull()
      .references(() => BlockPack.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    parentBlockId: text("parent_block_id"),
    prevBlockId: text("prev_block_id"),
    nextBlockId: text("next_block_id"),
    type: text("type").notNull().default("paragraph"),
    props: text("props", { mode: "json" })
      .$type<JSONType>()
      .notNull()
      .default(sql`'{}'`),
    content: text("content", { mode: "json" })
      .$type<JSONType[]>()
      .notNull()
      .default(sql`'[]'`),
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
    foreignKey({
      columns: [table.prevBlockId],
      foreignColumns: [table.id],
      name: "block_fk_prev_block_id",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
    foreignKey({
      columns: [table.nextBlockId],
      foreignColumns: [table.id],
      name: "block_fk_next_block_id",
    })
      .onUpdate("cascade")
      .onDelete("set null"),
  ]
);

export const BlockRelations = relations(Block, ({ one, many }) => ({
  blockPack: one(BlockPack, {
    fields: [Block.blockPackId],
    references: [BlockPack.id],
  }),
  parent: one(Block, {
    fields: [Block.parentBlockId],
    references: [Block.id],
    relationName: "block_relation_parent_children",
  }),
  children: many(Block, {
    relationName: "block_relation_parent_children",
  }),
  prev: one(Block, {
    fields: [Block.prevBlockId],
    references: [Block.id],
    relationName: "block_relation_prev_next",
  }),
  next: one(Block, {
    fields: [Block.nextBlockId],
    references: [Block.prevBlockId],
    relationName: "block_relation_prev_next",
  }),
}));
