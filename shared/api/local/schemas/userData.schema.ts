import { user } from "@shared/api/local/schemas/user.schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the userData in api interface and shard type
export const userData = sqliteTable("UserDataTable", {
  publicId: text("public_id")
    .primaryKey()
    .references(() => user.publicId),
  name: text("name").unique().notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role").notNull().default("Guest"),
  plan: text("plan").notNull().default("Free"),
  status: text("status").notNull().default("Online"),
  avatarURL: text("avatar_url"),
  language: text("language").notNull().default("English"),
  generalSettingCode: integer("general_setting_code").notNull().default(0),
  privacySettingCode: integer("privacy_setting_code").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
