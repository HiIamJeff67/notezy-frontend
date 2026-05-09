import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import * as schema from "./schemas";

const sqlocalDrizzle = new SQLocalDrizzle({
  databasePath: "database.sqlite3",
  onInit: () => [],
});

const { driver: rawDriver, batchDriver: rawBatchDriver, exec } = sqlocalDrizzle;

export { exec };

export const localDB = drizzle(rawDriver, rawBatchDriver, { schema });
