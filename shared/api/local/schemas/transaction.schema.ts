import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const transaction = sqliteTable(
  "TransactionTable",
  {
    id: text("id").primaryKey(),
    entityId: text("entity_id").notNull(), // the id stored in the local sqlite database, use this to find the data and update its id to the actual id coming from the backend
    entityType: text("entity_type").notNull(), // "rootShelf", "subShelf", "blockPack", "blockGroup", "block"
    actionType: text("action_type").notNull(), // "Create", "Update", "Delete"
    payload: text("payload").notNull(), // parsed request body
    retryCount: integer("retry_count").notNull().default(0),
    lastError: text("last_error"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(new Date()),
  },
  table => [
    uniqueIndex("transaction_unique_idx_entity_id_entity_type_action_type").on(
      table.entityId,
      table.entityType,
      table.actionType
    ),
  ]
);
