import {
  type BulkLinkRoutineItemsByIdsRequest,
  BulkLinkRoutineItemsByIdsRequestSchema,
  type BulkLinkRoutineTagsByIdsRequest,
  BulkLinkRoutineTagsByIdsRequestSchema,
  type LinkRoutineItemByIdRequest,
  LinkRoutineItemByIdRequestSchema,
  type LinkRoutineTagByIdRequest,
  LinkRoutineTagByIdRequestSchema,
} from "@shared/api/interfaces/routine.interface";
import { Transaction } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import type { InferSelectModel } from "drizzle-orm";
import type {
  SyncBuildResult,
  SyncHeader,
  SyncProgressReporter,
} from "./TransactionSynchronizerProvider";

interface RoutineRelationMutators {
  linkRoutineTagMutator: {
    mutateAsync: (request: LinkRoutineTagByIdRequest) => Promise<unknown>;
  };
  bulkLinkRoutineTagsMutator: {
    mutateAsync: (request: BulkLinkRoutineTagsByIdsRequest) => Promise<unknown>;
  };
  linkRoutineItemMutator: {
    mutateAsync: (request: LinkRoutineItemByIdRequest) => Promise<unknown>;
  };
  bulkLinkRoutineItemsMutator: {
    mutateAsync: (
      request: BulkLinkRoutineItemsByIdsRequest
    ) => Promise<unknown>;
  };
}

interface BuildRoutineRelationSyncResultOptions extends SyncProgressReporter {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  mutators: RoutineRelationMutators;
}

export const buildRoutineRelationSyncResult = ({
  transactions,
  header,
  mutators,
  onParsed,
}: BuildRoutineRelationSyncResultOptions): SyncBuildResult => {
  const operations: Array<() => Promise<unknown>> = [];
  const sequences = new Set<number>();
  const parseFailedSequences = new Set<number>();

  for (const transaction of transactions) {
    onParsed?.();
    const request = {
      body: transaction.body as unknown,
      ...(transaction.affected !== null &&
      typeof transaction.affected === "object"
        ? { affected: transaction.affected as unknown }
        : {}),
    };

    if (transaction.entityType === TransactionEntityType.RoutinesToTags) {
      const one = LinkRoutineTagByIdRequestSchema.safeParse(request);
      if (one.success) {
        const expectedAction = one.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          parseFailedSequences.add(transaction.sequence);
          continue;
        }
        operations.push(() =>
          mutators.linkRoutineTagMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = BulkLinkRoutineTagsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        const expectedAction = many.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          parseFailedSequences.add(transaction.sequence);
          continue;
        }
        operations.push(() =>
          mutators.bulkLinkRoutineTagsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.entityType === TransactionEntityType.RoutinesToItems) {
      const one = LinkRoutineItemByIdRequestSchema.safeParse(request);
      if (one.success) {
        const expectedAction = one.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          parseFailedSequences.add(transaction.sequence);
          continue;
        }
        operations.push(() =>
          mutators.linkRoutineItemMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = BulkLinkRoutineItemsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        const expectedAction = many.data.body.isUnlink
          ? TransactionActionType.DELETE
          : TransactionActionType.CREATE;
        if (transaction.actionType !== expectedAction) {
          parseFailedSequences.add(transaction.sequence);
          continue;
        }
        operations.push(() =>
          mutators.bulkLinkRoutineItemsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    parseFailedSequences.add(transaction.sequence);
  }

  const operationSequences = Array.from(sequences);
  let previousOperation = Promise.resolve<unknown>(undefined);

  return {
    syncJobs: operations.map((operation, index) => ({
      sequences: new Set([operationSequences[index]]),
      run: () => {
        const currentOperation = previousOperation.then(async () => {
          const result = await operation();
          if (
            typeof result === "object" &&
            result !== null &&
            "success" in result &&
            result.success === false
          ) {
            throw new Error("routine relation synchronization failed");
          }
          return result;
        });
        previousOperation = currentOperation;
        return currentOperation;
      },
    })),
    noopSequences: new Set<number>(),
    parseFailedSequences,
  };
};
