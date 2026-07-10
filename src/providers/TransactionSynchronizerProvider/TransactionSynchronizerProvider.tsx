import {
  useDeleteMyBlocksByIds,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import {
  useCreateBlockPacks,
  useDeleteMyBlockPacksByIds,
  useMoveMyBlockPacksByParentSubShelfIds,
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
  useCreateRoutineByStationId,
  useCreateRoutinesByStationIds,
  useDeleteMyRoutineById,
  useDeleteMyRoutinesByIds,
  useHardDeleteMyRoutineById,
  useHardDeleteMyRoutinesByIds,
  useLinkRoutineItemById,
  useLinkRoutineItemsByIds,
  useLinkRoutineTagById,
  useLinkRoutineTagsByIds,
  useRestoreMyRoutineById,
  useRestoreMyRoutinesByIds,
  useUpdateMyRoutineById,
  useUpdateMyRoutinesByIds,
} from "@shared/api/hooks/routine.hook";
import {
  useCreateRoutineTag,
  useCreateRoutineTags,
  useHardDeleteMyRoutineTagById,
  useHardDeleteMyRoutineTagsByIds,
  useUpdateMyRoutineTagById,
  useUpdateMyRoutineTagsByIds,
} from "@shared/api/hooks/routineTag.hook";
import {
  useCreateStation,
  useCreateStations,
  useDeleteMyStationById,
  useDeleteMyStationsByIds,
  useHardDeleteMyStationById,
  useHardDeleteMyStationsByIds,
  useRestoreMyStationById,
  useRestoreMyStationsByIds,
  useUpdateMyStationById,
  useUpdateMyStationsByIds,
} from "@shared/api/hooks/station.hook";
import {
  useCreateSubShelvesByRootShelfIds,
  useDeleteMySubShelvesByIds,
  useMoveMySubShelvesByRootShelfIds,
  useRestoreMySubShelvesByIds,
  useUpdateMySubShelvesByIds,
} from "@shared/api/hooks/subShelf.hook";
import { localDB } from "@shared/api/local/db";
import { Transaction, User } from "@shared/api/local/schemas";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import {
  asc,
  eq,
  InferSelectModel,
  inArray,
} from "drizzle-orm";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useNetwork } from "@/hooks";
import { mergeBlockPackTransactions } from "./BlockPackSyncLogic";
import { mergeBlockTransactions } from "./BlockSyncLogic";
import { mergeRootShelfTransactions } from "./RootShelfSyncLogic";
import { mergeRoutineRelationTransactions } from "./RoutineRelationSyncLogic";
import { mergeRoutineTransactions } from "./RoutineSyncLogic";
import { mergeRoutineTagTransactions } from "./RoutineTagSyncLogic";
import { mergeStationTransactions } from "./StationSyncLogic";
import { mergeSubShelfTransactions } from "./SubShelfSyncLogic";

/* ============================== General types ============================== */

export type EntityState<TBody> = {
  sequences: Set<number>;
  body: TBody;
};

export type SyncJob = {
  sequences: Set<number>;
  run: () => Promise<unknown>;
};

export type MergedResult = {
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

export const MAX_TRANSACTION_RETRY_COUNT = 5;

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
  getTransactionCount: () => Promise<number>;
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

  const createStationMutator = useCreateStation();
  const createStationsMutator = useCreateStations();
  const updateStationMutator = useUpdateMyStationById();
  const updateStationsMutator = useUpdateMyStationsByIds();
  const restoreStationMutator = useRestoreMyStationById();
  const restoreStationsMutator = useRestoreMyStationsByIds();
  const deleteStationMutator = useDeleteMyStationById();
  const deleteStationsMutator = useDeleteMyStationsByIds();
  const hardDeleteStationMutator = useHardDeleteMyStationById();
  const hardDeleteStationsMutator = useHardDeleteMyStationsByIds();

  const createRoutineMutator = useCreateRoutineByStationId();
  const createRoutinesMutator = useCreateRoutinesByStationIds();
  const updateRoutineMutator = useUpdateMyRoutineById();
  const updateRoutinesMutator = useUpdateMyRoutinesByIds();
  const restoreRoutineMutator = useRestoreMyRoutineById();
  const restoreRoutinesMutator = useRestoreMyRoutinesByIds();
  const deleteRoutineMutator = useDeleteMyRoutineById();
  const deleteRoutinesMutator = useDeleteMyRoutinesByIds();
  const hardDeleteRoutineMutator = useHardDeleteMyRoutineById();
  const hardDeleteRoutinesMutator = useHardDeleteMyRoutinesByIds();
  const linkRoutineTagMutator = useLinkRoutineTagById();
  const linkRoutineTagsMutator = useLinkRoutineTagsByIds();
  const linkRoutineItemMutator = useLinkRoutineItemById();
  const linkRoutineItemsMutator = useLinkRoutineItemsByIds();

  const createRoutineTagMutator = useCreateRoutineTag();
  const createRoutineTagsMutator = useCreateRoutineTags();
  const updateRoutineTagMutator = useUpdateMyRoutineTagById();
  const updateRoutineTagsMutator = useUpdateMyRoutineTagsByIds();
  const hardDeleteRoutineTagMutator = useHardDeleteMyRoutineTagById();
  const hardDeleteRoutineTagsMutator = useHardDeleteMyRoutineTagsByIds();

  const createSubShelvesMutator = useCreateSubShelvesByRootShelfIds();
  const updateSubShelvesMutator = useUpdateMySubShelvesByIds();
  const moveSubShelvesMutator = useMoveMySubShelvesByRootShelfIds();
  const restoreSubShelvesMutator = useRestoreMySubShelvesByIds();
  const deleteSubShelvesMutator = useDeleteMySubShelvesByIds();

  const createBlockPacksMutator = useCreateBlockPacks();
  const updateBlockPacksMutator = useUpdateMyBlockPacksByIds();
  const moveBlockPacksMutator = useMoveMyBlockPacksByParentSubShelfIds();
  const restoreBlockPacksMutator = useRestoreMyBlockPacksByIds();
  const deleteBlockPacksMutator = useDeleteMyBlockPacksByIds();

  const insertBlocksMutator = useInsertBlocks();
  const updateBlocksMutator = useUpdateMyBlocksByIds();
  const deleteBlocksMutator = useDeleteMyBlocksByIds();

  const [synchronizationProgress, setSynchronizationProgress] =
    useState<number>(0);
  const hasBootstrappedRef = useRef<boolean>(false);
  const isBootstrappingRef = useRef<boolean>(false);
  const isSynchronizingRef = useRef<boolean>(false);

  const getTransactionCount = useCallback(async (): Promise<number> => {
    if (!localDB.isReady) await localDB.ensureReady();
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

  const syncMergedResult = useCallback(
    async (
      transactions: InferSelectModel<typeof Transaction>[],
      mergedResult: MergedResult,
      onJobFinished: () => void
    ) => {
      if (mergedResult.syncJobs.length === 0) {
        const noopAndParseFailed = Array.from(
          new Set([...mergedResult.noopSequences, ...mergedResult.parseFailedSequences])
        );
        if (noopAndParseFailed.length > 0) {
          if (!localDB.isReady) await localDB.ensureReady();
          await localDB
            .delete(Transaction)
            .where(inArray(Transaction.sequence, noopAndParseFailed));
        }
        return;
      }

      const settledSyncJobs = await Promise.allSettled(
        mergedResult.syncJobs.map(job => job.run())
      );

      const succeededSequences = new Set<number>(mergedResult.noopSequences);
      const failedSequences = new Set<number>(mergedResult.parseFailedSequences);

      settledSyncJobs.forEach((settledSyncJob, index) => {
        const sequences = mergedResult.syncJobs[index].sequences;
        // A job is only considered synchronized when:
        //  1. the promise is fulfilled, and
        //  2. it is not an offline/local fallback response (a fallback response indicate that `success === false`).
        // `fulfilled + success:false` means request handling completed,
        // but server synchronization did not actually succeed yet.
        if (
          settledSyncJob.status === "fulfilled" &&
          !(
            typeof settledSyncJob.value === "object" &&
            settledSyncJob.value !== null &&
            "success" in settledSyncJob.value &&
            settledSyncJob.value.success === false
          )
        ) {
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
              retryCount: Math.min(
                (current?.retryCount ?? 0) + 1,
                MAX_TRANSACTION_RETRY_COUNT
              ),
              lastError:
                (current?.retryCount ?? 0) + 1 >= MAX_TRANSACTION_RETRY_COUNT
                  ? "maximum retry count reached"
                  : "synchronize transaction failed",
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

    if (!localDB.isReady) await localDB.ensureReady();
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

    const transactions = localData.transactions.filter(
      transaction => transaction.retryCount < MAX_TRANSACTION_RETRY_COUNT
    );
    if (!localData.ownerPublicId || transactions.length === 0) {
      setSynchronizationProgress(1);
      return;
    }

    const rootShelfTransactions: InferSelectModel<typeof Transaction>[] = [];
    const subShelfTransactions: InferSelectModel<typeof Transaction>[] = [];
    const blockPackTransactions: InferSelectModel<typeof Transaction>[] = [];
    const blockTransactions: InferSelectModel<typeof Transaction>[] = [];
    const stationTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineTagTransactions: InferSelectModel<typeof Transaction>[] = [];
    const routineRelationTransactions: InferSelectModel<typeof Transaction>[] =
      [];
    for (const transaction of transactions) {
      switch (transaction.entityType) {
        case TransactionEntityType.RootShelf:
          rootShelfTransactions.push(transaction);
          break;
        case TransactionEntityType.SubShelf:
          subShelfTransactions.push(transaction);
          break;
        case TransactionEntityType.BlockPack:
          blockPackTransactions.push(transaction);
          break;
        case TransactionEntityType.Block:
          blockTransactions.push(transaction);
          break;
        case TransactionEntityType.Station:
          stationTransactions.push(transaction);
          break;
        case TransactionEntityType.Routine:
          routineTransactions.push(transaction);
          break;
        case TransactionEntityType.RoutineTag:
          routineTagTransactions.push(transaction);
          break;
        case TransactionEntityType.RoutinesToTags:
        case TransactionEntityType.RoutinesToItems:
          routineRelationTransactions.push(transaction);
          break;
        default:
          throw new Error("undefined transaction entity type");
      }
    }

    const parseUnits = transactions.length;
    let parsedUnits = 0;

    const handleOnParsed = () => {
      parsedUnits += 1;
      if (parseUnits === 0) return;
      setSynchronizationProgress((parsedUnits / parseUnits) * 0.5);
    };

    const allMergedResults = [
      {
        transactions: rootShelfTransactions,
        mergedResult: mergeRootShelfTransactions({
          transactions: rootShelfTransactions,
          header,
          mutators: {
            createRootShelvesMutator,
            updateRootShelvesMutator,
            restoreRootShelvesMutator,
            deleteRootShelvesMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: subShelfTransactions,
        mergedResult: mergeSubShelfTransactions({
          transactions: subShelfTransactions,
          header,
          mutators: {
            createSubShelvesMutator,
            updateSubShelvesMutator,
            moveSubShelvesMutator,
            restoreSubShelvesMutator,
            deleteSubShelvesMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: blockPackTransactions,
        mergedResult: mergeBlockPackTransactions({
          transactions: blockPackTransactions,
          header,
          mutators: {
            createBlockPacksMutator,
            updateBlockPacksMutator,
            moveBlockPacksMutator,
            restoreBlockPacksMutator,
            deleteBlockPacksMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: blockTransactions,
        mergedResult: mergeBlockTransactions({
          transactions: blockTransactions,
          header,
          mutators: {
            insertBlocksMutator,
            updateBlocksMutator,
            deleteBlocksMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: stationTransactions,
        mergedResult: mergeStationTransactions({
          transactions: stationTransactions,
          header,
          mutators: {
            createStationMutator,
            createStationsMutator,
            updateStationMutator,
            updateStationsMutator,
            restoreStationMutator,
            restoreStationsMutator,
            deleteStationMutator,
            deleteStationsMutator,
            hardDeleteStationMutator,
            hardDeleteStationsMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: routineTransactions,
        mergedResult: mergeRoutineTransactions({
          transactions: routineTransactions,
          header,
          mutators: {
            createRoutineMutator,
            createRoutinesMutator,
            updateRoutineMutator,
            updateRoutinesMutator,
            restoreRoutineMutator,
            restoreRoutinesMutator,
            deleteRoutineMutator,
            deleteRoutinesMutator,
            hardDeleteRoutineMutator,
            hardDeleteRoutinesMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: routineTagTransactions,
        mergedResult: mergeRoutineTagTransactions({
          transactions: routineTagTransactions,
          header,
          mutators: {
            createRoutineTagMutator,
            createRoutineTagsMutator,
            updateRoutineTagMutator,
            updateRoutineTagsMutator,
            hardDeleteRoutineTagMutator,
            hardDeleteRoutineTagsMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
      {
        transactions: routineRelationTransactions,
        mergedResult: mergeRoutineRelationTransactions({
          transactions: routineRelationTransactions,
          header,
          mutators: {
            linkRoutineTagMutator,
            linkRoutineTagsMutator,
            linkRoutineItemMutator,
            linkRoutineItemsMutator,
          },
          onParsed: handleOnParsed,
        }),
      },
    ];

    const totalJobs = allMergedResults.reduce(
      (count, item) => count + item.mergedResult.syncJobs.length,
      0
    );
    let completedJobs = 0;

    const handleJobOnFinished = () => {
      completedJobs += 1;
      if (totalJobs === 0) return;
      setSynchronizationProgress(0.5 + (completedJobs / totalJobs) * 0.5);
    };

    for (const item of allMergedResults) {
      await syncMergedResult(
        item.transactions,
        item.mergedResult,
        handleJobOnFinished
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
    createStationMutator,
    createStationsMutator,
    updateStationMutator,
    updateStationsMutator,
    restoreStationMutator,
    restoreStationsMutator,
    deleteStationMutator,
    deleteStationsMutator,
    hardDeleteStationMutator,
    hardDeleteStationsMutator,
    createRoutineMutator,
    createRoutinesMutator,
    updateRoutineMutator,
    updateRoutinesMutator,
    restoreRoutineMutator,
    restoreRoutinesMutator,
    deleteRoutineMutator,
    deleteRoutinesMutator,
    hardDeleteRoutineMutator,
    hardDeleteRoutinesMutator,
    linkRoutineTagMutator,
    linkRoutineTagsMutator,
    linkRoutineItemMutator,
    linkRoutineItemsMutator,
    createRoutineTagMutator,
    createRoutineTagsMutator,
    updateRoutineTagMutator,
    updateRoutineTagsMutator,
    hardDeleteRoutineTagMutator,
    hardDeleteRoutineTagsMutator,
    syncMergedResult,
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

        const latestMigrationVersion = localDB.getLatestMigrationVersion();
        let currentStoredVersion = await localDB.getVersion();

        if (currentStoredVersion === 0 && latestMigrationVersion > 0) {
          safelySetStatus("migrating");
          await localDB.ensureMigrated({
            currentVersion: 0,
            targetVersion: latestMigrationVersion,
          });
          currentStoredVersion = await localDB.getVersion();
        }

        let missingTablesDetected = false;
        const safelyResolveTransactionCount = async (): Promise<number> => {
          try {
            return await getTransactionCount();
          } catch {
            missingTablesDetected = true;
            currentStoredVersion = 0;
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
          await localDB.ensureMigrated({
            currentVersion: currentStoredVersion,
            targetVersion: latestMigrationVersion,
          });
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

  useEffect(() => {
    let cancelled = false;

    const synchronizeWhenOnline = async () => {
      if (!isOnline || isSynchronizingRef.current) return;

      const pendingCount = await getTransactionCount();
      if (pendingCount === 0) {
        if (!cancelled && hasBootstrappedRef.current) {
          setStatus("synchronized");
        }
        return;
      }

      isSynchronizingRef.current = true;
      if (!cancelled) setStatus("synchronizing");
      try {
        await synchronizeTransactions();
        const remainingCount = await getTransactionCount();
        if (!cancelled) {
          setStatus(remainingCount > 0 ? "unsynchronized" : "synchronized");
        }
      } catch (error) {
        console.error(
          "failed to synchronize transactions on online event:",
          error
        );
        if (!cancelled) setStatus("unsynchronized");
      } finally {
        isSynchronizingRef.current = false;
      }
    };

    void synchronizeWhenOnline();

    return () => {
      cancelled = true;
    };
  }, [isOnline, getTransactionCount, synchronizeTransactions]);

  return (
    <TransactionSynchronizerContext.Provider
      value={{
        status: status,
        synchronizationProgress: synchronizationProgress,
        getTransactionCount: getTransactionCount,
        synchronizeTransactions: synchronizeTransactions,
      }}
    >
      {children}
    </TransactionSynchronizerContext.Provider>
  );
};
