import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the user in api interface and shard type
export const user = sqliteTable("UserTable", {
  publicId: text("public_id").primaryKey(),
  name: text("name").unique().notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull().default("Guest"),
  plan: text("plan").notNull().default("Free"),
  status: text("status").notNull().default("Online"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
