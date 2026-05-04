import { user } from "@shared/api/local/schemas/user.schema";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// the same schemas as the userAccount in api interface and shard type
export const userAccount = sqliteTable("UserAccountTable", {
  publicId: text("public_id")
    .primaryKey()
    .references(() => user.publicId, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  countryCode: text("country_code"),
  phoneNumber: text("phone_number"),
  googleCredential: text("google_credential"),
  discordCredential: text("discord_credential"),
  rootShelfCount: integer("root_shelf_count").notNull().default(0),
  blockPackCount: integer("block_pack_count").notNull().default(0),
  blockCount: integer("block_count").notNull().default(0),
  materialCount: integer("material_count").notNull().default(0),
  workflowCount: integer("workflow_count").notNull().default(0),
  additionalItemCount: integer("additional_items_count").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(new Date()),
});
