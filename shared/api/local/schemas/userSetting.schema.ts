import { user } from "@shared/api/local/schemas/user.schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the userSetting in api interface and shard type
export const userSetting = sqliteTable("UserSettingTable", {
  publicId: text("public_id")
    .primaryKey()
    .references(() => user.publicId, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  language: text("language").notNull().default("English"),
  generalSettingCode: integer("general_setting_code").notNull().default(0),
  privacySettingCode: integer("privacy_setting_code").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
