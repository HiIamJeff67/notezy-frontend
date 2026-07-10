import {
  type CreateStationRequest,
  CreateStationRequestSchema,
  type CreateStationsRequest,
  CreateStationsRequestSchema,
  type DeleteMyStationByIdRequest,
  DeleteMyStationByIdRequestSchema,
  type DeleteMyStationsByIdsRequest,
  DeleteMyStationsByIdsRequestSchema,
  type HardDeleteMyStationByIdRequest,
  HardDeleteMyStationByIdRequestSchema,
  type HardDeleteMyStationsByIdsRequest,
  HardDeleteMyStationsByIdsRequestSchema,
  type RestoreMyStationByIdRequest,
  RestoreMyStationByIdRequestSchema,
  type RestoreMyStationsByIdsRequest,
  RestoreMyStationsByIdsRequestSchema,
  type UpdateMyStationByIdRequest,
  UpdateMyStationByIdRequestSchema,
  type UpdateMyStationsByIdsRequest,
  UpdateMyStationsByIdsRequestSchema,
} from "@shared/api/interfaces/station.interface";
import { Transaction } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import type { InferSelectModel } from "drizzle-orm";
import type {
  MergedResult,
  SyncHeader,
  SyncProgressReporter,
} from "./TransactionSynchronizerProvider";

interface StationMutators {
  createStationMutator: {
    mutateAsync: (request: CreateStationRequest) => Promise<unknown>;
  };
  createStationsMutator: {
    mutateAsync: (request: CreateStationsRequest) => Promise<unknown>;
  };
  updateStationMutator: {
    mutateAsync: (request: UpdateMyStationByIdRequest) => Promise<unknown>;
  };
  updateStationsMutator: {
    mutateAsync: (request: UpdateMyStationsByIdsRequest) => Promise<unknown>;
  };
  restoreStationMutator: {
    mutateAsync: (request: RestoreMyStationByIdRequest) => Promise<unknown>;
  };
  restoreStationsMutator: {
    mutateAsync: (request: RestoreMyStationsByIdsRequest) => Promise<unknown>;
  };
  deleteStationMutator: {
    mutateAsync: (request: DeleteMyStationByIdRequest) => Promise<unknown>;
  };
  deleteStationsMutator: {
    mutateAsync: (request: DeleteMyStationsByIdsRequest) => Promise<unknown>;
  };
  hardDeleteStationMutator: {
    mutateAsync: (request: HardDeleteMyStationByIdRequest) => Promise<unknown>;
  };
  hardDeleteStationsMutator: {
    mutateAsync: (
      request: HardDeleteMyStationsByIdsRequest
    ) => Promise<unknown>;
  };
}

interface MergeStationTransactionOptions extends SyncProgressReporter {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  mutators: StationMutators;
}

export const mergeStationTransactions = ({
  transactions,
  header,
  mutators,
  onParsed,
}: MergeStationTransactionOptions): MergedResult => {
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

    if (transaction.entityType !== TransactionEntityType.Station) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    if (transaction.actionType === TransactionActionType.CREATE) {
      const one = CreateStationRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.createStationMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = CreateStationsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.createStationsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.UPDATE) {
      const one = UpdateMyStationByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.updateStationMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = UpdateMyStationsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.updateStationsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.RESTORE) {
      const one = RestoreMyStationByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.restoreStationMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = RestoreMyStationsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.restoreStationsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.DELETE) {
      const one = DeleteMyStationByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.deleteStationMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = DeleteMyStationsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.deleteStationsMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.HARD_DELETE) {
      const one = HardDeleteMyStationByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.hardDeleteStationMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = HardDeleteMyStationsByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.hardDeleteStationsMutator.mutateAsync({
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
            throw new Error("station synchronization failed");
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
