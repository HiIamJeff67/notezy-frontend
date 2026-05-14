import { User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Transaction = sqliteTable("TransactionTable", {
  sequence: integer("sequence").primaryKey({ autoIncrement: true }),
  ownerPublicId: text("owner_public_id")
    .notNull()
    .references(() => User.publicId),
  entityType: text("entity_type").$type<TransactionEntityType>().notNull(), // "RootShelf", "SubShelf", "BlockPack", "BlockGroup", "Block"
  actionType: text("action_type").$type<TransactionActionType>().notNull(), // "CREATE", "UPDATE", "MOVE", "RESTORE", "DELETE", etc.
  body: text("body", { mode: "json" }).notNull(), // parsed request body
  affected: text("affected", { mode: "json" }),
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
