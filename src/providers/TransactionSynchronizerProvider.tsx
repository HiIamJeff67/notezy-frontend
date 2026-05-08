import { NotezyLocalDatabaseError } from "@shared/api/errors/localDatabase.error";
import { LocalDatabaseClientExceptions } from "@shared/api/exceptions/client/localDatabase.exception";
import {
  useDeleteMyBlocksByIds,
  useInsertBlocks,
  useUpdateMyBlocksByIds,
} from "@shared/api/hooks/block.hook";
import {
  useBatchMoveMyBlockGroupsByIds,
  useDeleteMyBlockGroupsByIds,
  useInsertBlockGroupsAndTheirBlocksByBlockPackId,
  useInsertBlockGroupsByBlockPackId,
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
  useMoveMySubShelves,
  useRestoreMySubShelvesByIds,
  useUpdateMySubShelvesByIds,
} from "@shared/api/hooks/subShelf.hook";
import { CreateRootShelvesRequest } from "@shared/api/interfaces/rootShelf.interface";
import { localDB } from "@shared/api/local/db";
import { Transaction, User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { LocalDBVersion } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { asc, eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { createContext, useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks";
import { getAuthorization } from "@/util/getAuthorization";

interface TransactionSynchronizerContextType {
  migrationStatus: "analyzing" | "migrating" | "up-to-date";
  getTransactions: () => Promise<InferSelectModel<typeof Transaction>[]>;
  appendTransactions: (
    transactions: {
      entityType: TransactionEntityType;
      actionType: TransactionActionType;
      isBatchAction: boolean;
      payload: JSON;
      retryCount: number;
      lastError: string | undefined;
    }[]
  ) => Promise<void>;
  synchronizeTransactions: () => Promise<void>;
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
  const [migrationStatus, setMigrationStatus] = useState<
    "analyzing" | "migrating" | "up-to-date"
  >("analyzing");
  const [synchronizationProgress, setSynchronizationProgress] =
    useState<number>(0);

  const { isOnline } = useUser();

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
  const insertBlockGroupsAndBlocksMutator =
    useInsertBlockGroupsAndTheirBlocksByBlockPackId();
  const insertBlockGroupsMutator = useInsertBlockGroupsByBlockPackId();
  const updateBlocksMutator = useUpdateMyBlocksByIds();
  const batchMoveBlockGroupsMutator = useBatchMoveMyBlockGroupsByIds();
  const deleteBlocksMutator = useDeleteMyBlocksByIds();
  const deleteBlockGroupsMutator = useDeleteMyBlockGroupsByIds();

  const getTransactions = useCallback(
    async (): Promise<InferSelectModel<typeof Transaction>[]> =>
      await localDB
        .select()
        .from(Transaction)
        .orderBy(asc(Transaction.sequence)),
    []
  );

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

  const synchronizeTransactions = useCallback(async () => {
    if (!isOnline) return;

    const userAgent = navigator.userAgent;
    const accessToken = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.accessToken
    );
    const createRootShelvesRequest: CreateRootShelvesRequest = {
      header: {
        userAgent: userAgent,
        authorization: getAuthorization(accessToken),
      },
      body: {
        createdRootShelves: [],
      },
    };
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      const transactions = await tx
        .select()
        .from(Transaction)
        .where(eq(Transaction.ownerPublicId, loggedInUser.publicId)) // get the transactions based on the current user
        .orderBy(asc(Transaction.sequence));
      for (const transaction of transactions) {
        switch (transaction.entityType) {
          case TransactionEntityType.RootShelf: {
            switch (transaction.actionType) {
              case TransactionActionType.CREATE:
                if (!transaction.isBatchAction) {
                  createRootShelvesRequest.body.createdRootShelves.push(
                    // transaction.payload
                  );
                }
                break;
              case TransactionActionType.UPDATE:
              case TransactionActionType.RESTORE:
              case TransactionActionType.DELETE:
            }
            break;
          }
          case TransactionEntityType.SubShelf:
            switch (transaction.actionType) {
              case TransactionActionType.CREATE:
              case TransactionActionType.UPDATE:
              case TransactionActionType.RESTORE:
              case TransactionActionType.DELETE:
            }
            break;
          case TransactionEntityType.BlockPack:
            switch (transaction.actionType) {
              case TransactionActionType.CREATE:
              case TransactionActionType.UPDATE:
              case TransactionActionType.RESTORE:
              case TransactionActionType.DELETE:
            }
            break;
          case TransactionEntityType.BlockGroup:
            switch (transaction.actionType) {
              case TransactionActionType.CREATE:
              case TransactionActionType.UPDATE:
              case TransactionActionType.RESTORE:
              case TransactionActionType.DELETE:
            }
            break;
          case TransactionEntityType.Block:
            switch (transaction.actionType) {
              case TransactionActionType.CREATE:
              case TransactionActionType.UPDATE:
              case TransactionActionType.RESTORE:
              case TransactionActionType.DELETE:
            }
            break;
        }
      }
    });
  }, []);

  useEffect(() => {
    const migrate = async () => {
      try {
        setMigrationStatus("migrating");
        synchronizeTransactions();
      } catch (error) {
      } finally {
        setMigrationStatus("up-to-date");
      }
    };

    const currentLocalDBVersion = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.currentLocalDBVersion
    );
    if (!currentLocalDBVersion || currentLocalDBVersion !== LocalDBVersion) {
      migrate();
    } else {
      setMigrationStatus("up-to-date");
    }
  }, []);

  return (
    <TransactionSynchronizerContext.Provider
      value={{
        migrationStatus: migrationStatus,
        getTransactions: getTransactions,
        appendTransactions: appendTransactions,
        synchronizeTransactions: synchronizeTransactions,
      }}
    >
      {children}
    </TransactionSynchronizerContext.Provider>
  );
};
