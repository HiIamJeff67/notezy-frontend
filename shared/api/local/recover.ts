import { SQLocalDrizzle } from "sqlocal/drizzle";

let isOPFSRecoveryInFlight: Promise<void> | null = null;

export const isOPFSMissingFileError = (error: unknown): boolean => {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "NotFoundError";
  }

  if (!(error instanceof Error)) return false;
  const message = error.message;
  return (
    message.includes("GetSyncHandleError") ||
    (message.includes("NotFoundError") &&
      (message.includes("xLock") ||
        message.includes(import.meta.env.VITE_LOCAL_DATABASE_PATH)))
  );
};

// try to recover database instance from the error about OPFS
export const recoverOPFSError = async (sqlocalDrizzle: SQLocalDrizzle) => {
  if (isOPFSRecoveryInFlight) return await isOPFSRecoveryInFlight;

  isOPFSRecoveryInFlight = (async () => {
    try {
      await sqlocalDrizzle.deleteDatabaseFile();
    } catch (error) {
      if (isOPFSMissingFileError(error)) return;
      throw error;
    }
  })().finally(() => {
    isOPFSRecoveryInFlight = null;
  });

  await isOPFSRecoveryInFlight;
};
