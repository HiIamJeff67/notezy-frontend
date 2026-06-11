import {
  type CreateRoutineByStationIdRequest,
  CreateRoutineByStationIdRequestSchema,
  type CreateRoutinesByStationIdsRequest,
  CreateRoutinesByStationIdsRequestSchema,
  type DeleteMyRoutineByIdRequest,
  DeleteMyRoutineByIdRequestSchema,
  type DeleteMyRoutinesByIdsRequest,
  DeleteMyRoutinesByIdsRequestSchema,
  type HardDeleteMyRoutineByIdRequest,
  HardDeleteMyRoutineByIdRequestSchema,
  type HardDeleteMyRoutinesByIdsRequest,
  HardDeleteMyRoutinesByIdsRequestSchema,
  type RestoreMyRoutineByIdRequest,
  RestoreMyRoutineByIdRequestSchema,
  type RestoreMyRoutinesByIdsRequest,
  RestoreMyRoutinesByIdsRequestSchema,
  type UpdateMyRoutineByIdRequest,
  UpdateMyRoutineByIdRequestSchema,
  type UpdateMyRoutinesByIdsRequest,
  UpdateMyRoutinesByIdsRequestSchema,
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

interface RoutineMutators {
  createRoutineMutator: {
    mutateAsync: (request: CreateRoutineByStationIdRequest) => Promise<unknown>;
  };
  createRoutinesMutator: {
    mutateAsync: (
      request: CreateRoutinesByStationIdsRequest
    ) => Promise<unknown>;
  };
  updateRoutineMutator: {
    mutateAsync: (request: UpdateMyRoutineByIdRequest) => Promise<unknown>;
  };
  updateRoutinesMutator: {
    mutateAsync: (request: UpdateMyRoutinesByIdsRequest) => Promise<unknown>;
  };
  restoreRoutineMutator: {
    mutateAsync: (request: RestoreMyRoutineByIdRequest) => Promise<unknown>;
  };
  restoreRoutinesMutator: {
    mutateAsync: (request: RestoreMyRoutinesByIdsRequest) => Promise<unknown>;
  };
  deleteRoutineMutator: {
    mutateAsync: (request: DeleteMyRoutineByIdRequest) => Promise<unknown>;
  };
  deleteRoutinesMutator: {
    mutateAsync: (request: DeleteMyRoutinesByIdsRequest) => Promise<unknown>;
  };
  hardDeleteRoutineMutator: {
    mutateAsync: (request: HardDeleteMyRoutineByIdRequest) => Promise<unknown>;
  };
  hardDeleteRoutinesMutator: {
    mutateAsync: (
      request: HardDeleteMyRoutinesByIdsRequest
    ) => Promise<unknown>;
  };
}

interface BuildRoutineSyncResultOptions extends SyncProgressReporter {
  transactions: InferSelectModel<typeof Transaction>[];
  header: SyncHeader;
  mutators: RoutineMutators;
}

export const buildRoutineSyncResult = ({
  transactions,
  header,
  mutators,
  onParsed,
}: BuildRoutineSyncResultOptions): SyncBuildResult => {
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

    if (transaction.entityType !== TransactionEntityType.Routine) {
      parseFailedSequences.add(transaction.sequence);
      continue;
    }

    if (transaction.actionType === TransactionActionType.CREATE) {
      const one = CreateRoutineByStationIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.createRoutineMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = CreateRoutinesByStationIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.createRoutinesMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.UPDATE) {
      const one = UpdateMyRoutineByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.updateRoutineMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = UpdateMyRoutinesByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.updateRoutinesMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.RESTORE) {
      const one = RestoreMyRoutineByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.restoreRoutineMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = RestoreMyRoutinesByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.restoreRoutinesMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.DELETE) {
      const one = DeleteMyRoutineByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.deleteRoutineMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = DeleteMyRoutinesByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.deleteRoutinesMutator.mutateAsync({
            header,
            body: many.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }
    }

    if (transaction.actionType === TransactionActionType.HARD_DELETE) {
      const one = HardDeleteMyRoutineByIdRequestSchema.safeParse(request);
      if (one.success) {
        operations.push(() =>
          mutators.hardDeleteRoutineMutator.mutateAsync({
            header,
            body: one.data.body,
          })
        );
        sequences.add(transaction.sequence);
        continue;
      }

      const many = HardDeleteMyRoutinesByIdsRequestSchema.safeParse(request);
      if (many.success) {
        operations.push(() =>
          mutators.hardDeleteRoutinesMutator.mutateAsync({
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
            throw new Error("routine synchronization failed");
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
