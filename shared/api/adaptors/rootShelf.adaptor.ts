import {
  CreateRootShelfRequest,
  CreateRootShelfResponse,
  CreateRootShelvesRequest,
  CreateRootShelvesResponse,
  GetMyRootShelfByIdRequest,
  GetMyRootShelfByIdResponse,
} from "@shared/api/interfaces/rootShelf.interface";
import { localDB } from "@shared/api/local/db";
import { RootShelf, Transaction, User } from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { generateUUID } from "@shared/types/uuidv4.type";
import type { UUID } from "crypto";
import { eq, InferSelectModel } from "drizzle-orm";

export class RootShelfLocalAdaptor {
  static async simulateGetMyRootShelfById(
    request: GetMyRootShelfByIdRequest
  ): Promise<InferSelectModel<typeof RootShelf> | null> {
    const existingRootShelf = await localDB.query.RootShelf.findFirst({
      where: eq(RootShelf.id, request.param.rootShelfId),
    });
    return existingRootShelf ?? null;
  }

  static async syncGetMyRootShelfById(
    response: GetMyRootShelfByIdResponse
  ): Promise<void> {
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
  }

  // sync mutation data should available while user is offline
  // please to make sure avoiding syncing mutation data for invalid user operation,
  //  ex. unauthorized operations, malicious operations
  static async simulateCreateRootShelf(
    request: CreateRootShelfRequest
  ): Promise<void> {
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
        entityType: "RootShelf",
        actionType: "CREATE",
        isBatchAction: false,
        payload: request,
      });
    });
  }

  static async syncCreateRootShelf(
    request: CreateRootShelfRequest,
    response: CreateRootShelfResponse
  ): Promise<void> {
    await localDB.insert(RootShelf).values({
      id: response.data.id,
      ownerPublicId: response.embedded.publicId,
      name: request.body.name,
    });
  }

  static async simulateCreateRootShelves(
    request: CreateRootShelvesRequest
  ): Promise<void> {
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
      await tx.insert(RootShelf).values(createdRootShelves);
      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.RootShelf,
        actionType: TransactionActionType.CREATE,
        isBatchAction: true,
        payload: request,
      });
    });
  }

  static async syncCreateRootShelves(
    request: CreateRootShelvesRequest,
    response: CreateRootShelvesResponse
  ): Promise<void> {
    const createdRootShelves = request.body.createdRootShelves.map(
      createdRootShelf => ({
        id: createdRootShelf.id ?? generateUUID(),
        ownerPublicId: response.embedded.publicId,
        name: createdRootShelf.name,
      })
    );
    await localDB.insert(RootShelf).values(createdRootShelves);
  }
}
