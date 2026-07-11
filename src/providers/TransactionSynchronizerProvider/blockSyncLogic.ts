import {
  DeleteMyBlockByIdRequestSchema,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsRequestSchema,
  type ArborizedEditableBlock,
  InsertBlockRequestSchema,
  InsertBlocksRequest,
  InsertBlocksRequestSchema,
  UpdateMyBlockByIdRequestSchema,
  UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsRequestSchema,
} from "@shared/api/interfaces/block.interface";
import { Transaction } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { InferSelectModel } from "drizzle-orm";
import {
  EntityState,
  getTransactionSequences,
  mergeSet,
  MergedTransactionsResult,
  MergedTransaction,
  PreparedSyncJobsResult,
  SyncHeader,
  SyncJob,
} from "./TransactionSynchronizerProvider";

interface BlockMutators {
  insertBlocksMutator: {
    mutateAsync: (request: InsertBlocksRequest) => Promise<unknown>;
  };
  updateBlocksMutator: {
    mutateAsync: (request: UpdateMyBlocksByIdsRequest) => Promise<unknown>;
  };
  deleteBlocksMutator: {
    mutateAsync: (request: DeleteMyBlocksByIdsRequest) => Promise<unknown>;
  };
}

interface PrepareBlockSyncJobsOptions {
  transactions: MergedTransaction[];
  header: SyncHeader;
  mutators: BlockMutators;
}

export const prepareBlockSyncJobs = ({
  transactions,
  header,
  mutators,
}: PrepareBlockSyncJobsOptions): PreparedSyncJobsResult => {
  const insertBlocksState: EntityState<
    InsertBlocksRequest["body"]["insertedBlocks"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };
  const insertBlockPackIds = new Set<string>();

  const updateBlocksState: EntityState<
    UpdateMyBlocksByIdsRequest["body"]["updatedBlocks"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };
  const updateBlockPackIds = new Set<string>();

  const deleteBlocksState: EntityState<
    DeleteMyBlocksByIdsRequest["body"]["blockIds"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };
  const deleteBlockPackIds = new Set<string>();

  const parseFailedSequences = new Set<number>();
  const noopSequences = new Set<number>();
  const syncJobs: SyncJob[] = [];
  for (const transaction of transactions) {
    const request = {
      body: transaction.body as unknown,
      ...(transaction.affected !== null &&
      typeof transaction.affected === "object"
        ? { affected: transaction.affected as unknown }
        : {}),
    };

    if (transaction.entityType !== TransactionEntityType.Block) {
      mergeSet(parseFailedSequences, getTransactionSequences(transaction));
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const one = InsertBlockRequestSchema.safeParse(request);
        if (one.success) {
          insertBlocksState.body.push(one.data.body);
          mergeSet(insertBlockPackIds, one.data.affected.blockPackIds);
          mergeSet(insertBlocksState.sequences, getTransactionSequences(transaction));
          break;
        }

        const many = InsertBlocksRequestSchema.safeParse(request);
        if (many.success) {
          if (many.data.body.insertedBlocks.length === 0) {
            mergeSet(noopSequences, getTransactionSequences(transaction));
            break;
          }
          insertBlocksState.body.push(...many.data.body.insertedBlocks);
          mergeSet(insertBlockPackIds, many.data.affected.blockPackIds);
          mergeSet(insertBlocksState.sequences, getTransactionSequences(transaction));
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      case TransactionActionType.UPDATE: {
        const one = UpdateMyBlockByIdRequestSchema.safeParse(request);
        if (one.success) {
          updateBlocksState.body.push({
            blockId: one.data.body.blockId,
            values: one.data.body.values,
            ...(one.data.body.setNull ? { setNull: one.data.body.setNull } : {}),
          });
          mergeSet(updateBlockPackIds, one.data.affected.blockPackIds);
          mergeSet(updateBlocksState.sequences, getTransactionSequences(transaction));
          break;
        }

        const many = UpdateMyBlocksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          updateBlocksState.body.push(...many.data.body.updatedBlocks);
          mergeSet(updateBlockPackIds, many.data.affected.blockPackIds);
          mergeSet(updateBlocksState.sequences, getTransactionSequences(transaction));
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      case TransactionActionType.DELETE: {
        const one = DeleteMyBlockByIdRequestSchema.safeParse(request);
        if (one.success) {
          deleteBlocksState.body.push(one.data.body.blockId);
          mergeSet(deleteBlockPackIds, one.data.affected.blockPackIds);
          mergeSet(deleteBlocksState.sequences, getTransactionSequences(transaction));
          break;
        }

        const many = DeleteMyBlocksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          deleteBlocksState.body.push(...many.data.body.blockIds);
          mergeSet(deleteBlockPackIds, many.data.affected.blockPackIds);
          mergeSet(deleteBlocksState.sequences, getTransactionSequences(transaction));
          break;
        }

        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
      default: {
        mergeSet(parseFailedSequences, getTransactionSequences(transaction));
        break;
      }
    }
  }

  if (insertBlocksState.body.length > 0) {
    const request: InsertBlocksRequest = {
      header,
      body: {
        insertedBlocks: insertBlocksState.body,
      },
      affected: {
        blockPackIds: Array.from(insertBlockPackIds),
      },
    };
    syncJobs.push({
      sequences: insertBlocksState.sequences,
      run: () => mutators.insertBlocksMutator.mutateAsync(request),
    });
  }

  if (updateBlocksState.body.length > 0) {
    const request: UpdateMyBlocksByIdsRequest = {
      header,
      body: {
        updatedBlocks: updateBlocksState.body,
      },
      affected: {
        blockPackIds: Array.from(updateBlockPackIds),
      },
    };
    syncJobs.push({
      sequences: updateBlocksState.sequences,
      run: () => mutators.updateBlocksMutator.mutateAsync(request),
    });
  }

  if (deleteBlocksState.body.length > 0) {
    const request: DeleteMyBlocksByIdsRequest = {
      header,
      body: {
        blockIds: deleteBlocksState.body,
      },
      affected: {
        blockPackIds: Array.from(deleteBlockPackIds),
      },
    };
    syncJobs.push({
      sequences: deleteBlocksState.sequences,
      run: () => mutators.deleteBlocksMutator.mutateAsync(request),
    });
  }

  return {
    syncJobs,
    noopSequences,
    parseFailedSequences,
  };
};

export const mergeBlockTransactions = ({
  transactions,
  onParsed,
}: {
  transactions: InferSelectModel<typeof Transaction>[];
  onParsed?: () => void;
}): MergedTransactionsResult => {
  type CreatedRoot = {
    transaction: MergedTransaction;
    blockPackId: string;
    parentBlockId?: string | null;
    prevBlockId?: string | null;
    root: ArborizedEditableBlock;
    mergedSequences: Set<number>;
  };
  type PendingUpdate = {
    transaction: MergedTransaction;
    blockId: string;
    values: Record<string, unknown>;
    setNull?: Record<string, boolean>;
    blockPackIds: Set<string>;
    mergedSequences: Set<number>;
  };
  type PendingDelete = {
    transaction: MergedTransaction;
    blockId: string;
    blockPackIds: Set<string>;
    mergedSequences: Set<number>;
  };

  const createdRoots = new Map<string, CreatedRoot>();
  const createdNodes = new Map<
    string,
    { rootId: string; node: ArborizedEditableBlock; parent?: ArborizedEditableBlock }
  >();
  const pendingUpdates = new Map<string, PendingUpdate>();
  const pendingDeletes = new Map<string, PendingDelete>();
  const passthrough: MergedTransaction[] = [];
  const noopSequences = new Set<number>();
  const parseFailedSequences = new Set<number>();

  const visitTree = (
    rootId: string,
    node: ArborizedEditableBlock,
    parent?: ArborizedEditableBlock
  ) => {
    createdNodes.set(node.id, { rootId, node, parent });
    node.children.forEach(child => visitTree(rootId, child, node));
  };

  const removeTreeIndex = (node: ArborizedEditableBlock) => {
    createdNodes.delete(node.id);
    node.children.forEach(removeTreeIndex);
  };

  const getTreeIds = (node: ArborizedEditableBlock): Set<string> => {
    const ids = new Set<string>([node.id]);
    node.children.forEach(child => {
      getTreeIds(child).forEach(id => ids.add(id));
    });
    return ids;
  };

  const addMergedTransaction = (
    transaction: InferSelectModel<typeof Transaction> | MergedTransaction,
    sequences: Set<number>
  ): MergedTransaction => ({
    ...transaction,
    mergedSequences: new Set(sequences),
  });

  for (const transaction of transactions) {
    onParsed?.();
    const request = {
      body: transaction.body as unknown,
      ...(transaction.affected !== null &&
      typeof transaction.affected === "object"
        ? { affected: transaction.affected as unknown }
        : {}),
    };

    if (transaction.entityType !== TransactionEntityType.Block) {
      passthrough.push(addMergedTransaction(transaction, new Set([transaction.sequence])));
      continue;
    }

    if (transaction.actionType === TransactionActionType.CREATE) {
      const one = InsertBlockRequestSchema.safeParse(request);
      const many = one.success ? undefined : InsertBlocksRequestSchema.safeParse(request);
      if (!one.success && !many?.success) {
        passthrough.push(addMergedTransaction(transaction, new Set([transaction.sequence])));
        continue;
      }

      const insertedBlocks = one.success
        ? [{
            blockPackId: one.data.body.blockPackId,
            parentBlockId: one.data.body.parentBlockId,
            prevBlockId: one.data.body.prevBlockId,
            arborizedEditableBlock: one.data.body.arborizedEditableBlock,
          }]
        : many!.data!.body.insertedBlocks;
      for (const inserted of insertedBlocks) {
        const rootId = inserted.arborizedEditableBlock.id;
        const rootTree = structuredClone(inserted.arborizedEditableBlock);
        const treeIds = getTreeIds(rootTree);
        const root: CreatedRoot = {
          transaction: addMergedTransaction(transaction, new Set([transaction.sequence])),
          blockPackId: inserted.blockPackId,
          parentBlockId:
            inserted.parentBlockId && treeIds.has(inserted.parentBlockId)
              ? null
              : inserted.parentBlockId,
          prevBlockId:
            inserted.prevBlockId && treeIds.has(inserted.prevBlockId)
              ? null
              : inserted.prevBlockId,
          mergedSequences: new Set([transaction.sequence]),
          root: rootTree,
        };
        createdRoots.set(rootId, root);
        visitTree(rootId, root.root);
      }
      continue;
    }

    if (transaction.actionType === TransactionActionType.UPDATE) {
      const one = UpdateMyBlockByIdRequestSchema.safeParse(request);
      const many = one.success ? undefined : UpdateMyBlocksByIdsRequestSchema.safeParse(request);
      if (!one.success && !many?.success) {
        parseFailedSequences.add(transaction.sequence);
        continue;
      }

      const updates = one.success
        ? [{
            blockId: one.data.body.blockId,
            values: one.data.body.values,
            setNull: one.data.body.setNull,
            blockPackIds: one.data.affected.blockPackIds,
          }]
        : many!.data!.body.updatedBlocks.map((updated, index) => ({
            blockId: updated.blockId,
            values: updated.values,
            setNull: updated.setNull,
            blockPackIds: [many!.data!.affected.blockPackIds[index] ?? many!.data!.affected.blockPackIds[0]],
          }));

      for (const update of updates) {
        const createdNode = createdNodes.get(update.blockId);
        if (createdNode) {
          const nodeValues = update.values as Record<string, unknown>;
          const node = createdNode.node as unknown as Record<string, unknown>;
          for (const field of ["type", "props", "content"]) {
            if (field in nodeValues) node[field] = nodeValues[field];
          }
          const root = createdRoots.get(createdNode.rootId);
          if (root) root.mergedSequences.add(transaction.sequence);
          continue;
        }

        const existing = pendingUpdates.get(update.blockId);
        if (existing) {
          existing.values = { ...existing.values, ...update.values };
          existing.setNull = { ...(existing.setNull ?? {}), ...(update.setNull ?? {}) };
          update.blockPackIds.forEach(id => existing.blockPackIds.add(id));
          existing.mergedSequences.add(transaction.sequence);
        } else {
          pendingUpdates.set(update.blockId, {
            transaction: addMergedTransaction(transaction, new Set([transaction.sequence])),
            blockId: update.blockId,
            values: { ...update.values },
            setNull: update.setNull,
            blockPackIds: new Set(update.blockPackIds),
            mergedSequences: new Set([transaction.sequence]),
          });
        }
      }
      continue;
    }

    if (transaction.actionType === TransactionActionType.DELETE) {
      const one = DeleteMyBlockByIdRequestSchema.safeParse(request);
      const many = one.success ? undefined : DeleteMyBlocksByIdsRequestSchema.safeParse(request);
      if (!one.success && !many?.success) {
        parseFailedSequences.add(transaction.sequence);
        continue;
      }

      const deletes = one.success
        ? [{ blockId: one.data.body.blockId, blockPackIds: one.data.affected.blockPackIds }]
        : many!.data!.body.blockIds.map((blockId, index) => ({
            blockId,
            blockPackIds: [many!.data!.affected.blockPackIds[index] ?? many!.data!.affected.blockPackIds[0]],
          }));

      for (const deletion of deletes) {
        const createdNode = createdNodes.get(deletion.blockId);
        if (createdNode) {
          const root = createdRoots.get(createdNode.rootId);
          if (root) {
            if (root.root.id === deletion.blockId) {
              createdRoots.delete(createdNode.rootId);
              removeTreeIndex(root.root);
              mergeSet(noopSequences, root.mergedSequences);
            } else if (createdNode.parent) {
              createdNode.parent.children = createdNode.parent.children.filter(
                child => child.id !== deletion.blockId
              );
              removeTreeIndex(createdNode.node);
            }
          }
          noopSequences.add(transaction.sequence);
          continue;
        }

        const pendingUpdate = pendingUpdates.get(deletion.blockId);
        const previousSequences = pendingUpdate?.mergedSequences ?? new Set<number>();
        pendingUpdates.delete(deletion.blockId);
        const existingDelete = pendingDeletes.get(deletion.blockId);
        if (existingDelete) {
          existingDelete.mergedSequences.add(transaction.sequence);
          deletion.blockPackIds.forEach(id => existingDelete.blockPackIds.add(id));
        } else {
          pendingDeletes.set(deletion.blockId, {
            transaction: addMergedTransaction(transaction, previousSequences),
            blockId: deletion.blockId,
            blockPackIds: new Set(deletion.blockPackIds),
            mergedSequences: new Set([...previousSequences, transaction.sequence]),
          });
        }
      }
      continue;
    }

    passthrough.push(addMergedTransaction(transaction, new Set([transaction.sequence])));
  }

  const mergedTransactions: MergedTransaction[] = [...passthrough];
  if (createdRoots.size > 0) {
    const roots = Array.from(createdRoots.values());
    const first = roots[0].transaction;
    mergedTransactions.push({
      ...first,
      actionType: TransactionActionType.CREATE,
      body: { insertedBlocks: roots.map(root => ({
        blockPackId: root.blockPackId,
        ...(root.parentBlockId !== undefined
          ? { parentBlockId: root.parentBlockId }
          : {}),
        ...(root.prevBlockId !== undefined
          ? { prevBlockId: root.prevBlockId }
          : {}),
        arborizedEditableBlock: root.root,
      })) },
      affected: { blockPackIds: Array.from(new Set(roots.map(root => root.blockPackId))) },
      mergedSequences: new Set(roots.flatMap(root => Array.from(root.mergedSequences))),
    });
  }
  if (pendingUpdates.size > 0) {
    const updates = Array.from(pendingUpdates.values());
    mergedTransactions.push({
      ...updates[0].transaction,
      actionType: TransactionActionType.UPDATE,
      body: { updatedBlocks: updates.map(update => ({
        blockId: update.blockId,
        values: update.values,
        ...(update.setNull ? { setNull: update.setNull } : {}),
      })) },
      affected: { blockPackIds: Array.from(new Set(updates.flatMap(update => Array.from(update.blockPackIds)))) },
      mergedSequences: new Set(updates.flatMap(update => Array.from(update.mergedSequences))),
    });
  }
  if (pendingDeletes.size > 0) {
    const deletes = Array.from(pendingDeletes.values());
    mergedTransactions.push({
      ...deletes[0].transaction,
      actionType: TransactionActionType.DELETE,
      body: { blockIds: deletes.map(deletion => deletion.blockId) },
      affected: { blockPackIds: Array.from(new Set(deletes.flatMap(deletion => Array.from(deletion.blockPackIds)))) },
      mergedSequences: new Set(deletes.flatMap(deletion => Array.from(deletion.mergedSequences))),
    });
  }

  return {
    transactions: mergedTransactions.sort((a, b) => a.sequence - b.sequence),
    noopSequences,
    parseFailedSequences,
  };
};
