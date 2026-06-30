import {
  InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema,
  InsertBlockGroupsByBlockPackIdsRequest,
  InsertBlockGroupsByBlockPackIdsRequestSchema,
  MoveMyBlockGroupsByBlockPackIdsRequest,
  MoveMyBlockGroupsByBlockPackIdsRequestSchema,
  DeleteMyBlockGroupByIdRequestSchema,
  DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsRequestSchema,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema,
  InsertBlockGroupByBlockPackIdRequestSchema,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequestSchema,
  InsertBlockGroupsByBlockPackIdRequestSchema,
  MoveMyBlockGroupByIdRequestSchema,
  MoveMyBlockGroupsByBlockPackIdRequestSchema,
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
  insertBlockGroupsAndBlocksMutator: {
    mutateAsync: (
      request: InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest
    ) => Promise<unknown>;
  };
  insertBlockGroupsMutator: {
    mutateAsync: (
      request: InsertBlockGroupsByBlockPackIdsRequest
    ) => Promise<unknown>;
  };
  moveBlockGroupsMutator: {
    mutateAsync: (
      request: MoveMyBlockGroupsByBlockPackIdsRequest
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
    InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest["body"]["blockGroupContents"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };

  const insertBlockGroupsState: EntityState<
    InsertBlockGroupsByBlockPackIdsRequest["body"]["blockPackContents"]
  > = {
    body: [],
    sequences: new Set<number>(),
  };

  const moveBlockGroupsState: EntityState<
    MoveMyBlockGroupsByBlockPackIdsRequest["body"]["movedBlockGroups"]
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
    const request = {
      body: transaction.body as unknown,
      ...(transaction.affected !== null &&
      typeof transaction.affected === "object"
        ? { affected: transaction.affected as unknown }
        : {}),
    };

    if (transaction.entityType !== TransactionEntityType.BlockGroup) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    switch (transaction.actionType) {
      case TransactionActionType.CREATE: {
        const oneWithBlocks =
          InsertBlockGroupAndItsBlocksByBlockPackIdRequestSchema.safeParse(
            request
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
            request
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
          InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequestSchema.safeParse(
            request
          );
        if (batchWithBlocks.success) {
          insertBlockGroupsWithBlocksState.body.push(
            ...batchWithBlocks.data.body.blockGroupContents
          );
          insertBlockGroupsWithBlocksState.sequences.add(transaction.sequence);
          break;
        }

        const oneWithoutBlocks =
          InsertBlockGroupByBlockPackIdRequestSchema.safeParse(request);
        if (oneWithoutBlocks.success) {
          insertBlockGroupsState.body.push({
            blockPackId: oneWithoutBlocks.data.body.blockPackId,
            blockGroupId: oneWithoutBlocks.data.body.blockGroupId,
            prevBlockGroupIds: oneWithoutBlocks.data.body.prevBlockGroupId,
          });
          insertBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const manyWithoutBlocks =
          InsertBlockGroupsByBlockPackIdRequestSchema.safeParse(request);
        if (manyWithoutBlocks.success) {
          insertBlockGroupsState.body.push(
            ...manyWithoutBlocks.data.body.blockPackContents.map(content => ({
              blockPackId: manyWithoutBlocks.data.body.blockPackId,
              blockGroupId: content.blockGroupId,
              prevBlockGroupIds: content.prevBlockGroupId,
            }))
          );
          insertBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const batchWithoutBlocks =
          InsertBlockGroupsByBlockPackIdsRequestSchema.safeParse(request);
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
        const one = MoveMyBlockGroupByIdRequestSchema.safeParse(request);
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
          MoveMyBlockGroupsByBlockPackIdRequestSchema.safeParse(request);
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
          MoveMyBlockGroupsByBlockPackIdsRequestSchema.safeParse(request);
        if (many.success) {
          moveBlockGroupsState.body.push(...many.data.body.movedBlockGroups);
          moveBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        parseFailedSequences.add(transaction.sequence);
        break;
      }
      case TransactionActionType.DELETE: {
        const one = DeleteMyBlockGroupByIdRequestSchema.safeParse(request);
        if (one.success) {
          deleteBlockGroupsState.body.push(one.data.body.blockGroupId);
          deleteBlockGroupPackIds.add(one.data.affected.blockPackId);
          if (one.data.affected.prevBlockGroupId) {
            deleteBlockGroupPrevIds.add(one.data.affected.prevBlockGroupId);
          }
          deleteBlockGroupsState.sequences.add(transaction.sequence);
          break;
        }

        const many = DeleteMyBlockGroupsByIdsRequestSchema.safeParse(request);
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
    const request: InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest = {
      header,
      body: {
        blockGroupContents: insertBlockGroupsWithBlocksState.body,
      },
    };
    syncJobs.push({
      sequences: insertBlockGroupsWithBlocksState.sequences,
      run: () =>
        mutators.insertBlockGroupsAndBlocksMutator.mutateAsync(request),
    });
  }

  if (insertBlockGroupsState.body.length > 0) {
    const request: InsertBlockGroupsByBlockPackIdsRequest = {
      header,
      body: {
        blockPackContents: insertBlockGroupsState.body,
      },
    };
    syncJobs.push({
      sequences: insertBlockGroupsState.sequences,
      run: () => mutators.insertBlockGroupsMutator.mutateAsync(request),
    });
  }

  if (moveBlockGroupsState.body.length > 0) {
    const request: MoveMyBlockGroupsByBlockPackIdsRequest = {
      header,
      body: {
        movedBlockGroups: moveBlockGroupsState.body,
      },
    };
    syncJobs.push({
      sequences: moveBlockGroupsState.sequences,
      run: () => mutators.moveBlockGroupsMutator.mutateAsync(request),
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
