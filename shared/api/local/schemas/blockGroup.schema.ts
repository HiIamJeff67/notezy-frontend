import { Block, BlockPack, User } from "@shared/api/local/schemas";
import { isNotNull, relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const BlockGroup = sqliteTable(
  "BlockGroupTable",
  {
    id: text("id").primaryKey(),
    ownerPublicId: text("owner_public_id")
      .notNull()
      .references(() => User.publicId, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    blockPackId: text("block_pack_id")
      .notNull()
      .references(() => BlockPack.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    prevBlockGroupId: text("prev_block_group_id"),
    syncBlockGroupId: text("sync_block_group_id"),
    size: integer("size").notNull().default(0),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    uniqueIndex("block_group_unique_idx_block_pack_id_prev_block_group_id")
      .on(table.blockPackId, table.prevBlockGroupId)
      .where(isNotNull(table.deletedAt)),
    foreignKey({
      columns: [table.prevBlockGroupId],
      foreignColumns: [table.id],
      name: "block_group_fk_prev_block_group_id",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const BlockGroupRelations = relations(BlockGroup, ({ one, many }) => ({
  owner: one(User, {
    fields: [BlockGroup.ownerPublicId],
    references: [User.publicId],
  }),
  blockPack: one(BlockPack, {
    fields: [BlockGroup.blockPackId],
    references: [BlockPack.id],
  }),
  prev: one(BlockGroup, {
    fields: [BlockGroup.prevBlockGroupId],
    references: [BlockGroup.id],
    relationName: "block_group_relation_prev_next",
  }),
  next: one(BlockGroup, {
    fields: [BlockGroup.id],
    references: [BlockGroup.prevBlockGroupId],
    relationName: "block_group_relation_prev_next",
  }),
  blocks: many(Block),
}));
