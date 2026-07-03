import { SupportedIcon } from "@shared/api/interfaces/enums";
import { BlockGroup, SubShelf } from "@shared/api/local/schemas";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the blockPack in api interface
export const BlockPack = sqliteTable("BlockPackTable", {
  id: text("id").primaryKey(),
  parentSubShelfId: text("parent_sub_shelf_id")
    .notNull()
    .references(() => SubShelf.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  name: text("name").notNull().default("undefined"),
  icon: text("icon").$type<SupportedIcon>(),
  headerBackgroundURL: text("header_background_url"),
  blockCount: integer("block_count").notNull().default(0),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const BlockPackRelations = relations(BlockPack, ({ one, many }) => ({
  parentSubShelf: one(SubShelf, {
    fields: [BlockPack.parentSubShelfId],
    references: [SubShelf.id],
  }),
  blockGroups: many(BlockGroup),
}));
