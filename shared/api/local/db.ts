import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";
import localMigrationJournal from "./migrations/meta/_journal.json";
import * as schema from "./schemas";

type RawSqlModuleMap = Record<string, string>;
type MigrationJournalEntry = {
  idx: number;
  tag: string;
};

type MigrationRecord = {
  tag: string;
  hash: string;
};

const migrationSqlModules = import.meta.glob("./migrations/*.sql", {
  eager: true,
  query: "?raw",
  import: "default",
}) as RawSqlModuleMap;

const sqlocalDrizzle = new SQLocalDrizzle({
  databasePath: "database.sqlite3",
  onInit: () => [],
});

const { driver: rawDriver, batchDriver: rawBatchDriver, exec } = sqlocalDrizzle;

const LOCAL_MIGRATIONS_TABLE = "__notezy_local_migrations";
let migrationPromise: Promise<void> | null = null;

function splitMigrationSqlStatements(sqlFileContent: string): string[] {
  return sqlFileContent
    .split("--> statement-breakpoint")
    .map(statement => statement.trim())
    .filter(Boolean);
}

function isUserDataViewCreateStatement(statement: string): boolean {
  return /^CREATE\s+VIEW\s+[`"]?UserDataView[`"]?\s+/i.test(statement.trim());
}

function hashMigrationContent(content: string): string {
  let hash = 2166136261;
  for (let i = 0; i < content.length; i += 1) {
    hash ^= content.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `fnv1a_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function getMigrationTagFromPath(path: string): string | null {
  const fileName = path.split("/").pop();
  if (!fileName || !fileName.endsWith(".sql")) return null;
  return fileName.replace(".sql", "");
}

async function ensureMigrationTableExists(): Promise<void> {
  await exec(
    `CREATE TABLE IF NOT EXISTS "${LOCAL_MIGRATIONS_TABLE}" (
      "tag" text PRIMARY KEY NOT NULL,
      "hash" text NOT NULL,
      "applied_at" integer NOT NULL
    )`,
    [],
    "run"
  );
}

async function doesTableExist(tableName: string): Promise<boolean> {
  const result = await exec(
    `SELECT "name" FROM "sqlite_schema" WHERE "type" = 'table' AND "name" = ? LIMIT 1`,
    [tableName],
    "all"
  );
  return result.rows.length > 0;
}

async function recoverPartiallyMigratedUserTable(): Promise<void> {
  const hasUserTable = await doesTableExist("UserTable");
  if (hasUserTable) return;

  const hasTempUserTable = await doesTableExist("__new_UserTable");
  if (!hasTempUserTable) return;

  await exec(`ALTER TABLE "__new_UserTable" RENAME TO "UserTable"`, [], "run");
}

function buildOrderedMigrations(): Array<{ tag: string; sqlContent: string }> {
  const sqlByTag = new Map<string, string>();
  for (const [path, sqlContent] of Object.entries(migrationSqlModules)) {
    const tag = getMigrationTagFromPath(path);
    if (!tag) continue;
    sqlByTag.set(tag, sqlContent);
  }

  const journalEntries = (localMigrationJournal.entries ??
    []) as MigrationJournalEntry[];
  const orderedEntries = [...journalEntries].sort((a, b) => a.idx - b.idx);

  return orderedEntries.map(entry => {
    const sqlContent = sqlByTag.get(entry.tag);
    if (!sqlContent) {
      throw new Error(
        `missing local migration SQL file for tag "${entry.tag}" in shared/api/local/migrations`
      );
    }

    return {
      tag: entry.tag,
      sqlContent: sqlContent,
    };
  });
}

function getLatestUserDataViewCreateStatement(
  orderedMigrations: Array<{ tag: string; sqlContent: string }>
): string | null {
  let latestUserDataViewCreateStatement: string | null = null;
  for (const migration of orderedMigrations) {
    const statements = splitMigrationSqlStatements(migration.sqlContent);
    for (const statement of statements) {
      if (!isUserDataViewCreateStatement(statement)) continue;
      latestUserDataViewCreateStatement = statement;
    }
  }

  return latestUserDataViewCreateStatement;
}

async function getAppliedMigrations(): Promise<Map<string, MigrationRecord>> {
  const result = await exec(
    `SELECT "tag", "hash" FROM "${LOCAL_MIGRATIONS_TABLE}"`,
    [],
    "all"
  );

  const tagIndex = result.columns.indexOf("tag");
  const hashIndex = result.columns.indexOf("hash");
  const appliedMigrations = new Map<string, MigrationRecord>();
  if (tagIndex < 0 || hashIndex < 0) return appliedMigrations;

  for (const row of result.rows as unknown[][]) {
    const tag = String(row[tagIndex] ?? "");
    const hash = String(row[hashIndex] ?? "");
    if (!tag) continue;
    appliedMigrations.set(tag, { tag, hash });
  }

  return appliedMigrations;
}

async function applyMigration(
  tag: string,
  hash: string,
  sqlStatements: string[]
): Promise<void> {
  const isCreateStatement = (statement: string) =>
    /^CREATE\s+(TABLE|UNIQUE\s+INDEX|INDEX|VIEW)\s+/i.test(statement.trim());

  const isAlreadyExistsSqliteError = (error: unknown): boolean => {
    if (!(error instanceof Error)) return false;
    return /already exists/i.test(error.message);
  };

  await exec("BEGIN", [], "run");
  try {
    for (const statement of sqlStatements) {
      try {
        await exec(statement, [], "run");
      } catch (error) {
        // Legacy users may already have tables/views from pre-migration builds.
        // We accept "already exists" only for CREATE statements and continue.
        if (isCreateStatement(statement) && isAlreadyExistsSqliteError(error)) {
          continue;
        }
        throw error;
      }
    }

    await exec(
      `INSERT INTO "${LOCAL_MIGRATIONS_TABLE}" ("tag", "hash", "applied_at") VALUES (?, ?, ?)`,
      [tag, hash, Date.now()],
      "run"
    );
    await exec("COMMIT", [], "run");
  } catch (error) {
    await exec("ROLLBACK", [], "run");
    throw error;
  }
}

async function runLocalDbMigrations(): Promise<void> {
  await recoverPartiallyMigratedUserTable();
  await ensureMigrationTableExists();
  const orderedMigrations = buildOrderedMigrations();
  const appliedMigrations = await getAppliedMigrations();

  for (const migration of orderedMigrations) {
    const expectedHash = hashMigrationContent(migration.sqlContent);
    const appliedMigration = appliedMigrations.get(migration.tag);
    if (appliedMigration) {
      if (appliedMigration.hash !== expectedHash) {
        throw new Error(
          `local migration hash mismatch at "${migration.tag}". expected "${expectedHash}" but got "${appliedMigration.hash}".`
        );
      }
      continue;
    }

    const statements = splitMigrationSqlStatements(migration.sqlContent);
    await applyMigration(migration.tag, expectedHash, statements);
  }

  const latestUserDataViewCreateStatement =
    getLatestUserDataViewCreateStatement(orderedMigrations);
  if (latestUserDataViewCreateStatement) {
    try {
      await exec(`SELECT 1 FROM "UserDataView" LIMIT 1`, [], "all");
    } catch (error) {
      if (
        error instanceof Error &&
        (/no such table: UserDataView/i.test(error.message) ||
          /error in view UserDataView/i.test(error.message))
      ) {
        await exec(`DROP VIEW IF EXISTS "UserDataView"`, [], "run");
        await exec(latestUserDataViewCreateStatement, [], "run");
      } else {
        throw error;
      }
    }
  }
}

export async function ensureLocalDbMigrated(): Promise<void> {
  if (migrationPromise) return migrationPromise;

  migrationPromise = runLocalDbMigrations().catch(error => {
    migrationPromise = null;
    throw error;
  });

  return migrationPromise;
}

if (typeof window !== "undefined") {
  void ensureLocalDbMigrated();
}

const driver = async (
  sql: string,
  params: unknown[],
  method: "all" | "get" | "run" | "values"
) => {
  await ensureLocalDbMigrated();
  return rawDriver(sql, params, method);
};

const batchDriver = async (
  queries: {
    sql: string;
    params: unknown[];
    method: "all" | "get" | "run" | "values";
  }[]
) => {
  await ensureLocalDbMigrated();
  return rawBatchDriver(queries);
};

export const localdb = drizzle(driver, batchDriver, { schema: schema });
