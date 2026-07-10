import {
  DeleteMyBlockByIdRequestSchema,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsRequestSchema,
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
  mergeSet,
  MergedResult,
  SyncHeader,
  SyncJob,
  SyncProgressReporter,
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

interface MergeBlockTransactionOptions extends SyncProgressReporter {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  mutators: BlockMutators;
}

export const mergeBlockTransactions = ({
  transactions,
  header,
  mutators,
  onParsed,
}: MergeBlockTransactionOptions): MergedResult => {
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
  const syncJobs: SyncJob[] = [];
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
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const one = InsertBlockRequestSchema.safeParse(request);
        if (one.success) {
          insertBlocksState.body.push(one.data.body);
          mergeSet(insertBlockPackIds, one.data.affected.blockPackIds);
          insertBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const many = InsertBlocksRequestSchema.safeParse(request);
        if (many.success) {
          insertBlocksState.body.push(...many.data.body.insertedBlocks);
          mergeSet(insertBlockPackIds, many.data.affected.blockPackIds);
          insertBlocksState.sequences.add(transaction.sequence);
          break;
        }

        parseFailedSequences.add(transaction.sequence);
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
          updateBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const many = UpdateMyBlocksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          updateBlocksState.body.push(...many.data.body.updatedBlocks);
          mergeSet(updateBlockPackIds, many.data.affected.blockPackIds);
          updateBlocksState.sequences.add(transaction.sequence);
          break;
        }

        parseFailedSequences.add(transaction.sequence);
        break;
      }
      case TransactionActionType.DELETE: {
        const one = DeleteMyBlockByIdRequestSchema.safeParse(request);
        if (one.success) {
          deleteBlocksState.body.push(one.data.body.blockId);
          mergeSet(deleteBlockPackIds, one.data.affected.blockPackIds);
          deleteBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const many = DeleteMyBlocksByIdsRequestSchema.safeParse(request);
        if (many.success) {
          deleteBlocksState.body.push(...many.data.body.blockIds);
          mergeSet(deleteBlockPackIds, many.data.affected.blockPackIds);
          deleteBlocksState.sequences.add(transaction.sequence);
          break;
        }

        parseFailedSequences.add(transaction.sequence);
        break;
      }
      default: {
        parseFailedSequences.add(transaction.sequence);
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
    noopSequences: new Set<number>(),
    parseFailedSequences,
  };
};
