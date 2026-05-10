import { CurrentEnvironment } from "@shared/constants/project";
import { Environment } from "@shared/types/environment.type";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import * as schema from "./schemas";

const sqlocalDrizzle = new SQLocalDrizzle({
  databasePath: "database.sqlite3",
  onInit: () => [],
});

const {
  driver: rawDriver,
  batchDriver: rawBatchDriver,
  exec: rawExec,
} = sqlocalDrizzle;

let localDBOperationChain: Promise<void> = Promise.resolve();

const runSerializedLocalDBOperation = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  const task = localDBOperationChain.then(operation, operation);
  localDBOperationChain = task.then(
    () => undefined,
    () => undefined
  );
  return task;
};

const drizzleDB = drizzle(rawDriver, rawBatchDriver, { schema });
const rawTransaction = drizzleDB.transaction.bind(drizzleDB);

export const localDB = drizzleDB;

(localDB as typeof drizzleDB & {
  transaction: typeof rawTransaction;
}).transaction = (async (...args: Parameters<typeof rawTransaction>) =>
  await runSerializedLocalDBOperation(async () =>
    await rawTransaction(...args)
  )) as typeof rawTransaction;

export const exec = async (...args: Parameters<typeof rawExec>) =>
  await runSerializedLocalDBOperation(async () => await rawExec(...args));

export const exportLocalDBFile = async (): Promise<File> => {
  if (CurrentEnvironment !== Environment.Development) {
    throw new Error(
      "local db export is only available in development environment"
    );
  }

  const databaseFile = await sqlocalDrizzle.getDatabaseFile();

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(databaseFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = databaseFile.name || "database.sqlite3";
    link.click();
    URL.revokeObjectURL(url);
  }

  return databaseFile;
};
