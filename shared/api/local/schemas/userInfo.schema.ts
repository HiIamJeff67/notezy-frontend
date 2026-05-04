import { user } from "@shared/api/local/schemas/user.schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the userInfo in api interface and shard type
export const userInfo = sqliteTable("UserInfoTable", {
  publicId: text("public_id")
    .primaryKey()
    .references(() => user.publicId, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  avatarURL: text("avatar_url"),
  header: text("header"),
  introduction: text("introduction"),
  gender: text("gender").notNull().default("PreferNotToSay"),
  country: text("country"),
  birthDate: integer("birth_date", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
