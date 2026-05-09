import {
  useDeleteMyBlocksByIds,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import {
  useBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds,
  useBatchInsertBlockGroupsByBlockPackIds,
  useBatchMoveMyBlockGroupsByIds,
  useDeleteMyBlockGroupsByIds,
} from "@shared/api/hooks/blockGroup.hook";
import {
  useBatchMoveMyBlockPacksByIds,
  useCreateBlockPacks,
  useDeleteMyBlockPacksByIds,
  useRestoreMyBlockPacksByIds,
  useUpdateMyBlockPacksByIds,
} from "@shared/api/hooks/blockPack.hook";
import {
  useCreateRootShelves,
  useDeleteMyRootShelvesByIds,
  useRestoreMyRootShelvesByIds,
  useUpdateMyRootShelvesByIds,
} from "@shared/api/hooks/rootShelf.hook";
import {
  useBatchMoveMySubShelves,
  useCreateSubShelvesByRootShelfIds,
  useDeleteMySubShelvesByIds,
  useRestoreMySubShelvesByIds,
  useUpdateMySubShelvesByIds,
} from "@shared/api/hooks/subShelf.hook";
import { localDB } from "@shared/api/local/db";
import {
  ensureLocalDBMigrated,
  getLatestLocalDBMigrationVersion,
} from "@shared/api/local/migrator";
import { Transaction, User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { LocalDBVersion } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import {
  asc,
  eq,
  InferInsertModel,
  InferSelectModel,
  inArray,
} from "drizzle-orm";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/hooks";
import { getAuthorization } from "@/util/getAuthorization";
import { buildBlockGroupSyncResult } from "./blockGroupSyncLogic";
import { buildBlockPackSyncResult } from "./blockPackSyncLogic";
import { buildBlockSyncResult } from "./blockSyncLogic";
import { buildRootShelfSyncResult } from "./rootShelfSyncLogic";
import { buildSubShelfSyncResult } from "./subShelfSyncLogic";

/* ============================== General types ============================== */

export type EntityState<TBody> = {
  sequences: Set<number>;
  body: TBody;
};

export type SyncJob = {
  sequences: Set<number>;
  run: () => Promise<unknown>;
};

export type SyncBuildResult = {
  syncJobs: SyncJob[];
  noopSequences: Set<number>;
  parseFailedSequences: Set<number>;
};

export type SyncHeader = {
  userAgent: string;
  authorization: string | undefined;
};

export type SyncProgressReporter = {
  onParsed?: () => void;
};

/* ============================== Helper functions ============================== */

export const getMergedSequences = (...sets: Set<number>[]): Set<number> => {
  const merged = new Set<number>();
  sets.forEach(set => set.forEach(value => merged.add(value)));
  return merged;
};

export const mergeSet = <T,>(target: Set<T>, values: Iterable<T>) => {
  for (const value of values) target.add(value);
};

export const dropEntityPendingOperations = (
  id: string,
  maps: Array<Map<string, EntityState<any>>>,
  noopSequences: Set<number>
) => {
  for (const map of maps) {
    const state = map.get(id);
    if (!state) continue;
    mergeSet(noopSequences, state.sequences);
    map.delete(id);
  }
};

interface TransactionSynchronizerContextType {
  status:
    | "unsynchronized"
    | "analyzing"
    | "synchronizing"
    | "migrating"
    | "synchronized";
  getTransactions: () => Promise<InferSelectModel<typeof Transaction>[]>;
  getTransactionCount: () => Promise<number>;
  appendTransactions: (
    transactions: {
      entityId: string;
      entityType: TransactionEntityType;
      actionType: TransactionActionType;
      payload: JSON;
      retryCount: number;
      lastError: string | undefined;
    }[]
  ) => Promise<void>;
  synchronizeTransactions: () => Promise<void>;
  synchronizationProgress: number;
}

export const TransactionSynchronizerContext = createContext<
  TransactionSynchronizerContextType | undefined
>(undefined);

interface TransactionSynchronizerProviderProps {
  children: React.ReactNode;
}

export const TransactionSynchronizerProvider = ({
  children,
}: TransactionSynchronizerProviderProps) => {
  const [status, setStatus] = useState<
    | "unsynchronized"
    | "analyzing"
    | "synchronizing"
    | "migrating"
    | "synchronized"
  >("analyzing");
  const { isOnline } = useNetwork();

  const createRootShelvesMutator = useCreateRootShelves();
  const updateRootShelvesMutator = useUpdateMyRootShelvesByIds();
  const restoreRootShelvesMutator = useRestoreMyRootShelvesByIds();
  const deleteRootShelvesMutator = useDeleteMyRootShelvesByIds();

  const createSubShelvesMutator = useCreateSubShelvesByRootShelfIds();
  const updateSubShelvesMutator = useUpdateMySubShelvesByIds();
  const moveSubShelvesMutator = useBatchMoveMySubShelves();
  const restoreSubShelvesMutator = useRestoreMySubShelvesByIds();
  const deleteSubShelvesMutator = useDeleteMySubShelvesByIds();

  const createBlockPacksMutator = useCreateBlockPacks();
  const updateBlockPacksMutator = useUpdateMyBlockPacksByIds();
  const moveBlockPacksMutator = useBatchMoveMyBlockPacksByIds();
  const restoreBlockPacksMutator = useRestoreMyBlockPacksByIds();
  const deleteBlockPacksMutator = useDeleteMyBlockPacksByIds();

  const insertBlocksMutator = useInsertBlocks();
  const batchInsertBlockGroupsAndBlocksMutator =
    useBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds();
  const batchInsertBlockGroupsMutator =
    useBatchInsertBlockGroupsByBlockPackIds();
  const updateBlocksMutator = useUpdateMyBlocksByIds();
  const batchMoveBlockGroupsMutator = useBatchMoveMyBlockGroupsByIds();
  const deleteBlocksMutator = useDeleteMyBlocksByIds();
  const deleteBlockGroupsMutator = useDeleteMyBlockGroupsByIds();

  const [synchronizationProgress, setSynchronizationProgress] =
    useState<number>(0);
  const hasBootstrappedRef = useRef<boolean>(false);
  const isBootstrappingRef = useRef<boolean>(false);

  const getTransactions = useCallback(
    async (): Promise<InferSelectModel<typeof Transaction>[]> =>
      await localDB
        .select()
        .from(Transaction)
        .orderBy(asc(Transaction.sequence)),
    []
  );

  const getTransactionCount = useCallback(async (): Promise<number> => {
    return await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return 0;

      const transactions = await tx
        .select({ sequence: Transaction.sequence })
        .from(Transaction)
        .where(eq(Transaction.ownerPublicId, loggedInUser.publicId));
      return transactions.length;
    });
  }, []);

  const appendTransactions = useCallback(
    async (
      transactions: Omit<
        InferInsertModel<typeof Transaction>,
        "ownerPublicId" | "sequence" | "createdAt"
      >[]
    ): Promise<void> => {
      await localDB.transaction(async tx => {
        const loggedInUser = await tx.query.User.findFirst({
          where: eq(User.isLoggedIn, true),
        });
        if (!loggedInUser) return;
        const insertedTransactions = transactions.map(t => ({
          ...t,
          ownerPublicId: loggedInUser.publicId,
        }));
        await tx.insert(Transaction).values(insertedTransactions);
      });
    },
    []
  );

  const persistSyncResult = useCallback(
    async (
      transactions: InferSelectModel<typeof Transaction>[],
      result: SyncBuildResult,
      onJobFinished: () => void
    ) => {
      if (result.syncJobs.length === 0) {
        const noopAndParseFailed = Array.from(
          new Set([...result.noopSequences, ...result.parseFailedSequences])
        );
        if (noopAndParseFailed.length > 0) {
          await localDB
            .delete(Transaction)
            .where(inArray(Transaction.sequence, noopAndParseFailed));
        }
        return;
      }

      const syncResults = await Promise.allSettled(
        result.syncJobs.map(job => job.run())
      );

      const succeededSequences = new Set<number>(result.noopSequences);
      const failedSequences = new Set<number>(result.parseFailedSequences);

      syncResults.forEach((syncResult, index) => {
        const sequences = result.syncJobs[index].sequences;
        if (syncResult.status === "fulfilled") {
          mergeSet(succeededSequences, sequences);
        } else {
          mergeSet(failedSequences, sequences);
        }
        onJobFinished();
      });

      if (succeededSequences.size > 0) {
        await localDB
          .delete(Transaction)
          .where(inArray(Transaction.sequence, Array.from(succeededSequences)));
      }

      if (failedSequences.size > 0) {
        for (const sequence of failedSequences) {
          const current = transactions.find(t => t.sequence === sequence);
          await localDB
            .update(Transaction)
            .set({
              retryCount: (current?.retryCount ?? 0) + 1,
              lastError: "synchronize transaction failed",
            })
            .where(eq(Transaction.sequence, sequence));
        }
      }
    },
    []
  );

  const synchronizeTransactions = useCallback(async () => {
    if (!isOnline) return;

    setSynchronizationProgress(0);

    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const header: SyncHeader = {
      userAgent,
      authorization: getAuthorization(accessToken),
    };

    const localData = await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return { ownerPublicId: undefined, transactions: [] };
      const transactions = await tx
        .select()
        .from(Transaction)
        .where(eq(Transaction.ownerPublicId, loggedInUser.publicId))
        .orderBy(asc(Transaction.sequence));
      return { ownerPublicId: loggedInUser.publicId, transactions };
    });

    const transactions = localData.transactions;
    if (!localData.ownerPublicId || transactions.length === 0) {
      setSynchronizationProgress(1);
      return;
    }

    const rootShelfTransactions = transactions.filter(
      transaction => transaction.entityType === TransactionEntityType.RootShelf
    );
    const subShelfTransactions = transactions.filter(
      transaction => transaction.entityType === TransactionEntityType.SubShelf
    );
    const blockPackTransactions = transactions.filter(
      transaction => transaction.entityType === TransactionEntityType.BlockPack
    );
    const blockGroupTransactions = transactions.filter(
      transaction => transaction.entityType === TransactionEntityType.BlockGroup
    );
    const blockTransactions = transactions.filter(
      transaction => transaction.entityType === TransactionEntityType.Block
    );

    const parseUnits = transactions.length;
    let parsedUnits = 0;

    const reportParsed = () => {
      parsedUnits += 1;
      if (parseUnits === 0) return;
      setSynchronizationProgress((parsedUnits / parseUnits) * 0.5);
    };

    const rootShelfResult = buildRootShelfSyncResult({
      transactions: rootShelfTransactions,
      header,
      mutators: {
        createRootShelvesMutator,
        updateRootShelvesMutator,
        restoreRootShelvesMutator,
        deleteRootShelvesMutator,
      },
      onParsed: reportParsed,
    });

    const subShelfResult = buildSubShelfSyncResult({
      transactions: subShelfTransactions,
      header,
      mutators: {
        createSubShelvesMutator,
        updateSubShelvesMutator,
        moveSubShelvesMutator,
        restoreSubShelvesMutator,
        deleteSubShelvesMutator,
      },
      onParsed: reportParsed,
    });

    const blockPackResult = buildBlockPackSyncResult({
      transactions: blockPackTransactions,
      header,
      mutators: {
        createBlockPacksMutator,
        updateBlockPacksMutator,
        moveBlockPacksMutator,
        restoreBlockPacksMutator,
        deleteBlockPacksMutator,
      },
      onParsed: reportParsed,
    });

    const blockGroupResult = buildBlockGroupSyncResult({
      transactions: blockGroupTransactions,
      header,
      mutators: {
        batchInsertBlockGroupsAndBlocksMutator,
        batchInsertBlockGroupsMutator,
        batchMoveBlockGroupsMutator,
        deleteBlockGroupsMutator,
      },
      onParsed: reportParsed,
    });

    const blockResult = buildBlockSyncResult({
      transactions: blockTransactions,
      header,
      mutators: {
        insertBlocksMutator,
        updateBlocksMutator,
        deleteBlocksMutator,
      },
      onParsed: reportParsed,
    });

    const allResults = [
      {
        transactions: rootShelfTransactions,
        result: rootShelfResult,
      },
      {
        transactions: subShelfTransactions,
        result: subShelfResult,
      },
      {
        transactions: blockPackTransactions,
        result: blockPackResult,
      },
      {
        transactions: blockGroupTransactions,
        result: blockGroupResult,
      },
      {
        transactions: blockTransactions,
        result: blockResult,
      },
    ];

    const totalJobs = allResults.reduce(
      (count, item) => count + item.result.syncJobs.length,
      0
    );
    let completedJobs = 0;

    const reportJobFinished = () => {
      completedJobs += 1;
      if (totalJobs === 0) return;
      setSynchronizationProgress(0.5 + (completedJobs / totalJobs) * 0.5);
    };

    for (const item of allResults) {
      await persistSyncResult(
        item.transactions,
        item.result,
        reportJobFinished
      );
    }

    setSynchronizationProgress(1);
  }, [
    isOnline,
    createRootShelvesMutator,
    updateRootShelvesMutator,
    restoreRootShelvesMutator,
    deleteRootShelvesMutator,
    createSubShelvesMutator,
    updateSubShelvesMutator,
    moveSubShelvesMutator,
    restoreSubShelvesMutator,
    deleteSubShelvesMutator,
    createBlockPacksMutator,
    updateBlockPacksMutator,
    moveBlockPacksMutator,
    restoreBlockPacksMutator,
    deleteBlockPacksMutator,
    insertBlocksMutator,
    updateBlocksMutator,
    deleteBlocksMutator,
    batchInsertBlockGroupsAndBlocksMutator,
    batchInsertBlockGroupsMutator,
    batchMoveBlockGroupsMutator,
    deleteBlockGroupsMutator,
    persistSyncResult,
  ]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      if (hasBootstrappedRef.current || isBootstrappingRef.current) return;
      isBootstrappingRef.current = true;

      const safelySetStatus = (
        nextStatus:
          | "unsynchronized"
          | "analyzing"
          | "synchronizing"
          | "migrating"
          | "synchronized"
      ) => {
        if (!cancelled) setStatus(nextStatus);
      };

      try {
        safelySetStatus("analyzing");

        const latestMigrationVersion = getLatestLocalDBMigrationVersion();
        let currentStoredVersion =
          LocalStorageManipulator.getItemByKey(
            LocalStorageKey.currentLocalDBVersion
          ) ?? "-1";

        if (
          LocalStorageManipulator.getItemByKey(
            LocalStorageKey.currentLocalDBVersion
          ) === null
        ) {
          LocalStorageManipulator.setItem(
            LocalStorageKey.currentLocalDBVersion,
            "-1"
          );
        }

        let missingTablesDetected = false;
        const safelyResolveTransactionCount = async (): Promise<number> => {
          try {
            return await getTransactionCount();
          } catch {
            missingTablesDetected = true;
            currentStoredVersion = "-1";
            LocalStorageManipulator.setItem(
              LocalStorageKey.currentLocalDBVersion,
              "-1"
            );
            return 0;
          }
        };

        const transactionCountBeforeMigration =
          await safelyResolveTransactionCount();

        if (
          missingTablesDetected ||
          currentStoredVersion !== latestMigrationVersion
        ) {
          if (transactionCountBeforeMigration > 0) {
            safelySetStatus("synchronizing");
            await synchronizeTransactions();
          }

          const transactionCountAfterSync =
            await safelyResolveTransactionCount();
          if (transactionCountAfterSync > 0) {
            safelySetStatus("unsynchronized");
            return;
          }

          safelySetStatus("migrating");
          await ensureLocalDBMigrated({
            currentVersion: currentStoredVersion,
            targetVersion: latestMigrationVersion,
          });
          LocalStorageManipulator.setItem(
            LocalStorageKey.currentLocalDBVersion,
            latestMigrationVersion || LocalDBVersion
          );
        } else {
          if (transactionCountBeforeMigration > 0) {
            safelySetStatus("synchronizing");
            await synchronizeTransactions();
          }
        }

        hasBootstrappedRef.current = true;
      } catch (error) {
        console.error(
          "failed to bootstrap transaction synchronization:",
          error
        );
        safelySetStatus("unsynchronized");
        return;
      } finally {
        isBootstrappingRef.current = false;
      }

      safelySetStatus("synchronized");
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [getTransactionCount, synchronizeTransactions]);

  return (
    <TransactionSynchronizerContext.Provider
      value={{
        status: status,
        synchronizationProgress: synchronizationProgress,
        getTransactions: getTransactions,
        getTransactionCount: getTransactionCount,
        appendTransactions: appendTransactions,
        synchronizeTransactions: synchronizeTransactions,
      }}
    >
      {children}
    </TransactionSynchronizerContext.Provider>
  );
};
