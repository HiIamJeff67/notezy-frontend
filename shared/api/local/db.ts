import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import * as schema from "./schemas";

const { driver, batchDriver } = new SQLocalDrizzle("database.sqlite3");
export const localdb = drizzle(driver, batchDriver, { schema: schema });
