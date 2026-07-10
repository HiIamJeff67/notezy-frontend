import {
  type CreateRoutineTagRequest,
  CreateRoutineTagRequestSchema,
  type CreateRoutineTagsRequest,
  CreateRoutineTagsRequestSchema,
  type HardDeleteMyRoutineTagByIdRequest,
  HardDeleteMyRoutineTagByIdRequestSchema,
  type HardDeleteMyRoutineTagsByIdsRequest,
  HardDeleteMyRoutineTagsByIdsRequestSchema,
  type UpdateMyRoutineTagByIdRequest,
  UpdateMyRoutineTagByIdRequestSchema,
  type UpdateMyRoutineTagsByIdsRequest,
  UpdateMyRoutineTagsByIdsRequestSchema,
} from "@shared/api/interfaces/routineTag.interface";
import { Transaction } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import type { InferSelectModel } from "drizzle-orm";
import type {
  MergedResult,
  SyncHeader,
  SyncProgressReporter,
} from "./TransactionSynchronizerProvider";

interface RoutineTagMutators {
  createRoutineTagMutator: {
    mutateAsync: (request: CreateRoutineTagRequest) => Promise<unknown>;
  };
  createRoutineTagsMutator: {
    mutateAsync: (request: CreateRoutineTagsRequest) => Promise<unknown>;
  };
  updateRoutineTagMutator: {
    mutateAsync: (request: UpdateMyRoutineTagByIdRequest) => Promise<unknown>;
  };
  updateRoutineTagsMutator: {
    mutateAsync: (request: UpdateMyRoutineTagsByIdsRequest) => Promise<unknown>;
  };
  hardDeleteRoutineTagMutator: {
    mutateAsync: (
      request: HardDeleteMyRoutineTagByIdRequest
    ) => Promise<unknown>;
  };
  hardDeleteRoutineTagsMutator: {
    mutateAsync: (
      request: HardDeleteMyRoutineTagsByIdsRequest
    ) => Promise<unknown>;
  };
}

interface MergeRoutineTagTransactionOptions extends SyncProgressReporter {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  mutators: RoutineTagMutators;
}

export const mergeRoutineTagTransactions = ({
  transactions,
  header,
  mutators,
  onParsed,
}: MergeRoutineTagTransactionOptions): MergedResult => {
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

    if (transaction.entityType !== TransactionEntityType.RoutineTag) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    if (transaction.actionType === TransactionActionType.CREATE) {
      const one = CreateRoutineTagRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.createRoutineTagMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = CreateRoutineTagsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.createRoutineTagsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.UPDATE) {
      const one = UpdateMyRoutineTagByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.updateRoutineTagMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = UpdateMyRoutineTagsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.updateRoutineTagsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.HARD_DELETE) {
      const one = HardDeleteMyRoutineTagByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.hardDeleteRoutineTagMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = HardDeleteMyRoutineTagsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.hardDeleteRoutineTagsMutator.mutateAsync({
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
            throw new Error("routine tag synchronization failed");
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
