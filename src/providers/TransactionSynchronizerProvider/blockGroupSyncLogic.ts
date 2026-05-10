import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema,
  BatchInsertBlockGroupsByBlockPackIdsRequest,
  BatchInsertBlockGroupsByBlockPackIdsRequestSchema,
  BatchMoveMyBlockGroupsByIdsRequest,
  BatchMoveMyBlockGroupsByIdsRequestSchema,
  DeleteMyBlockGroupByIdRequestSchema,
  DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsRequestSchema,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema,
  InsertBlockGroupByBlockPackIdRequestSchema,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  InsertBlockGroupsByBlockPackIdRequestSchema,
  MoveMyBlockGroupByIdRequestSchema,
  MoveMyBlockGroupsByIdsRequestSchema,
} from "@shared/api/interfaces/blockGroup.interface";
import { Transaction } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { InferSelectModel } from "drizzle-orm";
import {
  EntityState,
  mergeSet,
  SyncBuildResult,
  SyncHeader,
  SyncJob,
  SyncProgressReporter,
} from "./TransactionSynchronizerProvider";

interface BlockGroupMutators {
  batchInsertBlockGroupsAndBlocksMutator: {
    mutateAsync: (
      request: BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest
    ) => Promise<unknown>;
  };
  batchInsertBlockGroupsMutator: {
    mutateAsync: (
      request: BatchInsertBlockGroupsByBlockPackIdsRequest
    ) => Promise<unknown>;
  };
  batchMoveBlockGroupsMutator: {
    mutateAsync: (
      request: BatchMoveMyBlockGroupsByIdsRequest
    ) => Promise<unknown>;
  };
  deleteBlockGroupsMutator: {
    mutateAsync: (request: DeleteMyBlockGroupsByIdsRequest) => Promise<unknown>;
  };
}

interface BuildBlockGroupSyncResultOptions extends SyncProgressReporter {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  mutators: BlockGroupMutators;
}

export const buildBlockGroupSyncResult = ({
  transactions,
  header,
  mutators,
  onParsed,
}: BuildBlockGroupSyncResultOptions): SyncBuildResult => {
  const insertBlockGroupsWithBlocksState: EntityState<
    BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest["body"]["blockGroupContents"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };

  const insertBlockGroupsState: EntityState<
    BatchInsertBlockGroupsByBlockPackIdsRequest["body"]["blockPackContents"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };

  const moveBlockGroupsState: EntityState<
    BatchMoveMyBlockGroupsByIdsRequest["body"]["movedBlockGroups"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };

  const deleteBlockGroupsState: EntityState<
    DeleteMyBlockGroupsByIdsRequest["body"]["blockGroupIds"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };
  const deleteBlockGroupPackIds = new Set<string>();
  const deleteBlockGroupPrevIds = new Set<string>();

  const parseFailedSequences = new Set<number>();
  const syncJobs: SyncJob[] = [];

  for (const transaction of transactions) {
    onParsed?.();
    const payload = transaction.payload as unknown;

    if (transaction.entityType !== TransactionEntityType.BlockGroup) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const oneWithBlocks =
          InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema.safeParse(
            payload
          );
        if (oneWithBlocks.success) {
          insertBlockGroupsWithBlocksState.body.push({
            blockPackId: oneWithBlocks.data.body.blockPackId,
            blockGroupId: oneWithBlocks.data.body.blockGroupId,
            prevBlockGroupId: oneWithBlocks.data.body.prevBlockGroupId,
            arborizedEditableBlock:
              oneWithBlocks.data.body.arborizedEditableBlock,
          });
          insertBlockGroupsWithBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const manyWithBlocks =
          InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema.safeParse(
            payload
          );
        if (manyWithBlocks.success) {
          insertBlockGroupsWithBlocksState.body.push(
            ...manyWithBlocks.data.body.blockGroupContents.map(content => ({
              blockPackId: manyWithBlocks.data.body.blockPackId,
              ...content,
            }))
          );
          insertBlockGroupsWithBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const batchWithBlocks =
          BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema.safeParse(
            payload
          );
        if (batchWithBlocks.success) {
          insertBlockGroupsWithBlocksState.body.push(
            ...batchWithBlocks.data.body.blockGroupContents
          );
          insertBlockGroupsWithBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const oneWithoutBlocks =
          InsertBlockGroupByBlockPackIdRequestSchema.safeParse(payload);
        if (oneWithoutBlocks.success) {
          insertBlockGroupsState.body.push({
            blockPackId: oneWithoutBlocks.data.body.blockPackId,
            blockGroupId: oneWithoutBlocks.data.body.blockGroupId,
            prevBlockGroupId: oneWithoutBlocks.data.body.prevBlockGroupId,
          });
          insertBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const manyWithoutBlocks =
          InsertBlockGroupsByBlockPackIdRequestSchema.safeParse(payload);
        if (manyWithoutBlocks.success) {
          insertBlockGroupsState.body.push(
            ...manyWithoutBlocks.data.body.blockPackContents.map(content => ({
              blockPackId: manyWithoutBlocks.data.body.blockPackId,
              ...content,
            }))
          );
          insertBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const batchWithoutBlocks =
          BatchInsertBlockGroupsByBlockPackIdsRequestSchema.safeParse(payload);
        if (batchWithoutBlocks.success) {
          insertBlockGroupsState.body.push(
            ...batchWithoutBlocks.data.body.blockPackContents
          );
          insertBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        parseFailedSequences.add(transaction.sequence);
        break;
      }
      case TransactionActionType.MOVE: {
        const one = MoveMyBlockGroupByIdRequestSchema.safeParse(payload);
        if (one.success) {
          moveBlockGroupsState.body.push({
            blockPackId: one.data.body.blockPackId,
            movableBlockGroupId: one.data.body.movableBlockGroupId,
            movablePrevBlockGroupId: one.data.body.movablePrevBlockGroupId,
            destinationBlockGroupId: one.data.body.destinationBlockGroupId,
          });
          moveBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const oneToMany =
          MoveMyBlockGroupsByIdsRequestSchema.safeParse(payload);
        if (oneToMany.success) {
          oneToMany.data.body.movableBlockGroupIds.forEach((id, index) => {
            moveBlockGroupsState.body.push({
              blockPackId: oneToMany.data.body.blockPackId,
              movableBlockGroupId: id,
              movablePrevBlockGroupId:
                oneToMany.data.body.movablePrevBlockGroupIds[index],
              destinationBlockGroupId:
                oneToMany.data.body.destinationBlockGroupId,
            });
          });
          moveBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const many =
          BatchMoveMyBlockGroupsByIdsRequestSchema.safeParse(payload);
        if (many.success) {
          moveBlockGroupsState.body.push(...many.data.body.movedBlockGroups);
          moveBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        parseFailedSequences.add(transaction.sequence);
        break;
      }
      case TransactionActionType.DELETE: {
        const one = DeleteMyBlockGroupByIdRequestSchema.safeParse(payload);
        if (one.success) {
          deleteBlockGroupsState.body.push(one.data.body.blockGroupId);
          deleteBlockGroupPackIds.add(one.data.affected.blockPackId);
          if (one.data.affected.prevBlockGroupId) {
            deleteBlockGroupPrevIds.add(one.data.affected.prevBlockGroupId);
          }
          deleteBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const many = DeleteMyBlockGroupsByIdsRequestSchema.safeParse(payload);
        if (many.success) {
          deleteBlockGroupsState.body.push(...many.data.body.blockGroupIds);
          mergeSet(deleteBlockGroupPackIds, many.data.affected.blockPackIds);
          mergeSet(
            deleteBlockGroupPrevIds,
            many.data.affected.prevBlockGroupIds
          );
          deleteBlockGroupsState.sequences.add(transaction.sequence);
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

  if (insertBlockGroupsWithBlocksState.body.length > 0) {
    const request: BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest = {
      header,
      body: {
        blockGroupContents: insertBlockGroupsWithBlocksState.body,
      },
    };
    syncJobs.push({
      sequences: insertBlockGroupsWithBlocksState.sequences,
      run: () =>
        mutators.batchInsertBlockGroupsAndBlocksMutator.mutateAsync(request),
    });
  }

  if (insertBlockGroupsState.body.length > 0) {
    const request: BatchInsertBlockGroupsByBlockPackIdsRequest = {
      header,
      body: {
        blockPackContents: insertBlockGroupsState.body,
      },
    };
    syncJobs.push({
      sequences: insertBlockGroupsState.sequences,
      run: () => mutators.batchInsertBlockGroupsMutator.mutateAsync(request),
    });
  }

  if (moveBlockGroupsState.body.length > 0) {
    const request: BatchMoveMyBlockGroupsByIdsRequest = {
      header,
      body: {
        movedBlockGroups: moveBlockGroupsState.body,
      },
    };
    syncJobs.push({
      sequences: moveBlockGroupsState.sequences,
      run: () => mutators.batchMoveBlockGroupsMutator.mutateAsync(request),
    });
  }

  if (deleteBlockGroupsState.body.length > 0) {
    const request: DeleteMyBlockGroupsByIdsRequest = {
      header,
      body: {
        blockGroupIds: deleteBlockGroupsState.body,
      },
      affected: {
        blockPackIds: Array.from(deleteBlockGroupPackIds),
        prevBlockGroupIds: Array.from(deleteBlockGroupPrevIds),
      },
    };
    syncJobs.push({
      sequences: deleteBlockGroupsState.sequences,
      run: () => mutators.deleteBlockGroupsMutator.mutateAsync(request),
    });
  }

  return {
    syncJobs,
    noopSequences: new Set<number>(),
    parseFailedSequences,
  };
};
