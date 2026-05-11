import {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
  UpdateMyRootShelfByIdRequest,
  UpdateMyRootShelfByIdResponse,
  UpdateMyRootShelvesByIdsRequest,
  UpdateMyRootShelvesByIdsResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { localDB } from "@shared/api/local/db";
import { RootShelf, Transaction, User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { and, eq, InferSelectModel, sql } from "drizzle-orm";

export class RootShelfLocalAdaptor {
  static simulateGetMyRootShelfById = async (
    request: GetMyRootShelfByIdRequest
  ): Promise<InferSelectModel<typeof RootShelf> | null> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const existingRootShelf = await localDB.query.RootShelf.findFirst({
      where: eq(RootShelf.id, request.param.rootShelfId),
    });
    return existingRootShelf ?? null;
  };

  static syncGetMyRootShelfById = async (
    response: GetMyRootShelfByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB
      .insert(RootShelf)
      .values({
        id: response.data.id,
        ownerPublicId: response.embedded.publicId,
        name: response.data.name,
        subShelfCount: response.data.subShelfCount,
        itemCount: response.data.itemCount,
        lastAnalyzedAt: response.data.lastAnalyzedAt,
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: RootShelf.id });
  };

  // sync mutation data should available while user is offline
  // please to make sure avoiding syncing mutation data for invalid user operation,
  //  ex. unauthorized operations, malicious operations
  static simulateCreateRootShelf = async (
    request: CreateRootShelfRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return; // return it directly since throw error in onError hooks will not effect anything
      const id = (request.body.id as UUID | undefined) ?? generateUUID();
      request.body.id = id; // make sure they are the same and the generated id is attached to the request body
      await tx.insert(RootShelf).values({
        id: id,
        ownerPublicId: loggedInUser.publicId,
        name: request.body.name,
      });
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityId: id,
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.CREATE,
        payload: request,
      });
    });
  };

  static syncCreateRootShelf = async (
    request: CreateRootShelfRequest,
    response: CreateRootShelfResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.insert(RootShelf).values({
      id: response.data.id,
      ownerPublicId: response.embedded.publicId,
      name: request.body.name,
    });
  };

  static simulateCreateRootShelves = async (
    request: CreateRootShelvesRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (loggedInUser === undefined) return;
      const createdRootShelves = request.body.createdRootShelves.map(
        createdRootShelf => ({
          id: createdRootShelf.id ?? generateUUID(),
          ownerPublicId: loggedInUser.publicId,
          name: createdRootShelf.name,
        })
      );
      request.body.createdRootShelves = createdRootShelves.map(
        createdRootShelf => ({
          id: createdRootShelf.id,
          name: createdRootShelf.name,
        })
      );
      await tx.insert(RootShelf).values(createdRootShelves);
      await tx.insert(Transaction).values(
        createdRootShelves.map(createdRootShelf => ({
          ownerPublicId: loggedInUser.publicId,
          entityId: createdRootShelf.id,
          entityType: TransactionEntityType.RootShelf,
          actionType: TransactionActionType.CREATE,
          payload: request,
        }))
      );
    });
  };

  static syncCreateRootShelves = async (
    request: CreateRootShelvesRequest,
    response: CreateRootShelvesResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const createdRootShelves = request.body.createdRootShelves.map(
      createdRootShelf => ({
        id: createdRootShelf.id ?? generateUUID(),
        ownerPublicId: response.embedded.publicId,
        name: createdRootShelf.name,
      })
    );
    await localDB.insert(RootShelf).values(createdRootShelves);
  };

  static simulateUpdateMyRootShelfById = async (
    request: UpdateMyRootShelfByIdRequest
  ): Promise<void> => {
    if (request.body.values.name) {
      if (!localDB.isReady) await localDB.ensureReady();
      await localDB.transaction(async tx => {
        const loggedInUser = await tx.query.User.findFirst({
          where: eq(User.isLoggedIn, true),
        });
        if (loggedInUser === undefined) return;
        await tx.update(RootShelf).set({
          name: request.body.values.name,
        });
        await tx.insert(Transaction).values({
          ownerPublicId: loggedInUser.publicId,
          entityId: request.body.rootShelfId,
          entityType: TransactionEntityType.RootShelf,
          actionType: TransactionActionType.UPDATE,
          payload: request,
        });
      });
    }
  };

  static syncUpdateMyRootShelfById = async (
    request: UpdateMyRootShelfByIdRequest,
    response: UpdateMyRootShelfByIdResponse
  ): Promise<void> => {
    if (request.body.values.name) {
      if (!localDB.isReady) await localDB.ensureReady();
      await localDB
        .update(RootShelf)
        .set({
          name: request.body.values.name,
        })
        .where(
          and(
            eq(RootShelf.id, request.body.rootShelfId),
            eq(RootShelf.ownerPublicId, response.embedded.publicId)
          )
        );
    }
  };

  static syncUpdateMyRootShelvesByIds = async (
    request: UpdateMyRootShelvesByIdsRequest,
    response: UpdateMyRootShelvesByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const valueSQL = sql.join(
      request.body.updatedRootShelves.map(
        valueArg => sql`(${valueArg.rootShelfId}, ${valueArg.values.name})`
      )
    );
    // await localDB.execute(sql`
    //   UPDATE ${RootShelf} as r
    //   SET
    //     name = v.name
    //   FROM (values ${valueSQL}) AS v(id, name)
    //   WHERE r.id = v.id
    // `);
  };
}
