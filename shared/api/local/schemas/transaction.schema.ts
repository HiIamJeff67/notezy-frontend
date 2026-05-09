import { User } from "@shared/api/local/schemas";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Transaction = sqliteTable("TransactionTable", {
  sequence: integer("sequence").primaryKey({ autoIncrement: true }),
  ownerPublicId: text("owner_public_id")
    .notNull()
    .references(() => User.publicId),
  entityId: text("entity_id").notNull(),
  entityType: text("entity_type").notNull(), // "RootShelf", "SubShelf", "BlockPack", "BlockGroup", "Block"
  actionType: text("action_type").notNull(), // "CREATE", "UPDATE", "MOVE", "RESTORE", "DELETE", etc.
  payload: text("payload", { mode: "json" }).notNull(), // parsed request body
  retryCount: integer("retry_count").notNull().default(0),
  lastError: text("last_error"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});

export const TransactionRelations = relations(Transaction, ({ one }) => ({
  owner: one(User, {
    fields: [Transaction.ownerPublicId],
    references: [User.publicId],
  }),
}));
