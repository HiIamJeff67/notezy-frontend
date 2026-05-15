import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  BatchInsertBlockGroupsByBlockPackIdsRequest,
  BatchMoveMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupsByIdsRequest,
  GetAllMyBlockGroupsByBlockPackIdRequest,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupByIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsByPrevBlockGroupIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  MoveMyBlockGroupByIdRequest,
  MoveMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupsByIdsRequest,
} from "@shared/api/interfaces/blockGroup.interface";
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockGroup,
  BlockPack,
  SubShelf,
  Transaction,
  User,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { EditableBlockManipulator } from "@shared/lib/editableBlockManipulator";
import { generateUUID } from "@shared/types/uuidv4.type";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockGroupLocalSimulator {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[],
    blockPackId?: string
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToShelves)
        .innerJoin(SubShelf, eq(SubShelf.rootShelfId, UsersToShelves.rootShelfId))
        .innerJoin(BlockPack, eq(BlockPack.parentSubShelfId, SubShelf.id))
        .where(
          and(
            eq(UsersToShelves.userPublicId, userPublicId),
            inArray(UsersToShelves.permission, permissions),
            blockPackId
              ? eq(BlockPack.id, blockPackId)
              : eq(BlockPack.id, BlockGroup.blockPackId)
          )
        )
    );

  private static getArborizedEditableBlock = async (
    tx: typeof localDB,
    blockGroupId: string
  ) => {
    const blocks = await tx.query.Block.findMany({
      where: eq(Block.blockGroupId, blockGroupId),
      columns: {
        id: true,
        parentBlockId: true,
        type: true,
        props: true,
        content: true,
      },
    });

    return EditableBlockManipulator.arborizeRows(
      blocks.map(block => ({
        id: block.id,
        parentBlockId: block.parentBlockId,
        type: block.type,
        props: block.props,
        content: block.content,
      }))
    );
  };

  static simulateGetMyBlockGroupById = async (
    request: GetMyBlockGroupByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
      .select({
        id: BlockGroup.id,
        blockPackId: BlockGroup.blockPackId,
        prevBlockGroupId: BlockGroup.prevBlockGroupId,
        syncBlockGroupId: BlockGroup.syncBlockGroupId,
        size: BlockGroup.size,
        deletedAt: BlockGroup.deletedAt,
        updatedAt: BlockGroup.updatedAt,
        createdAt: BlockGroup.createdAt,
      })
      .from(BlockGroup)
      .where(
        and(
          eq(BlockGroup.id, request.param.blockGroupId),
          BlockGroupLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ])
        )
      )
      .limit(1);

    return rows[0] ?? null;
  };

  static simulateGetMyBlockGroupAndItsBlocksById = async (
    request: GetMyBlockGroupAndItsBlocksByIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const blockGroup = await localDB.query.BlockGroup.findFirst({
      where: and(
        eq(BlockGroup.id, request.param.blockGroupId),
        BlockGroupLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
          AccessControlPermission.Read,
          AccessControlPermission.Write,
          AccessControlPermission.Admin,
          AccessControlPermission.Owner,
        ])
      ),
    });
    if (!blockGroup) return null;

    const rawArborizedEditableBlock = await BlockGroupLocalSimulator.getArborizedEditableBlock(
      localDB,
      blockGroup.id
    );

    return {
      id: blockGroup.id,
      blockPackId: blockGroup.blockPackId,
      prevBlockGroupId: blockGroup.prevBlockGroupId,
      syncBlockGroupId: blockGroup.syncBlockGroupId,
      size: blockGroup.size,
      deletedAt: blockGroup.deletedAt,
      updatedAt: blockGroup.updatedAt,
      createdAt: blockGroup.createdAt,
      rawArborizedEditableBlock,
    };
  };

  static simulateGetMyBlockGroupsAndTheirBlocksByIds = async (
    request: GetMyBlockGroupsAndTheirBlocksByIdsRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const blockGroups = await localDB.query.BlockGroup.findMany({
      where: and(
        inArray(BlockGroup.id, request.param.blockGroupIds),
        BlockGroupLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
          AccessControlPermission.Read,
          AccessControlPermission.Write,
          AccessControlPermission.Admin,
          AccessControlPermission.Owner,
        ])
      ),
    });

    const results = [] as Array<{
      id: string;
      blockPackId: string;
      prevBlockGroupId: string | null;
      syncBlockGroupId: string | null;
      size: number;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
      rawArborizedEditableBlock: unknown;
    }>;

    for (const blockGroup of blockGroups) {
      results.push({
        id: blockGroup.id,
        blockPackId: blockGroup.blockPackId,
        prevBlockGroupId: blockGroup.prevBlockGroupId,
        syncBlockGroupId: blockGroup.syncBlockGroupId,
        size: blockGroup.size,
        deletedAt: blockGroup.deletedAt,
        updatedAt: blockGroup.updatedAt,
        createdAt: blockGroup.createdAt,
        rawArborizedEditableBlock:
          await BlockGroupLocalSimulator.getArborizedEditableBlock(
            localDB,
            blockGroup.id
          ),
      });
    }

    return results;
  };

  static simulateGetMyBlockGroupsAndTheirBlocksByBlockPackId = async (
    request: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const blockGroups = await localDB.query.BlockGroup.findMany({
      where: and(
        eq(BlockGroup.blockPackId, request.param.blockPackId),
        BlockGroupLocalSimulator.getPassPermissionCheckSQL(
          localDB,
          loggedInUser.publicId,
          [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ],
          request.param.blockPackId
        )
      ),
    });

    const results = [] as Array<{
      id: string;
      blockPackId: string;
      prevBlockGroupId: string | null;
      syncBlockGroupId: string | null;
      size: number;
      deletedAt: Date | null;
      updatedAt: Date;
      createdAt: Date;
      rawArborizedEditableBlock: unknown;
    }>;

    for (const blockGroup of blockGroups) {
      results.push({
        id: blockGroup.id,
        blockPackId: blockGroup.blockPackId,
        prevBlockGroupId: blockGroup.prevBlockGroupId,
        syncBlockGroupId: blockGroup.syncBlockGroupId,
        size: blockGroup.size,
        deletedAt: blockGroup.deletedAt,
        updatedAt: blockGroup.updatedAt,
        createdAt: blockGroup.createdAt,
        rawArborizedEditableBlock:
          await BlockGroupLocalSimulator.getArborizedEditableBlock(
            localDB,
            blockGroup.id
          ),
      });
    }

    return results;
  };

  static simulateGetMyBlockGroupsByPrevBlockGroupId = async (
    request: GetMyBlockGroupsByPrevBlockGroupIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    return await localDB.query.BlockGroup.findMany({
      where: and(
        eq(BlockGroup.prevBlockGroupId, request.param.prevBlockGroupId),
        BlockGroupLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
          AccessControlPermission.Read,
          AccessControlPermission.Write,
          AccessControlPermission.Admin,
          AccessControlPermission.Owner,
        ])
      ),
    });
  };

  static simulateGetAllMyBlockGroupsByBlockPackId = async (
    request: GetAllMyBlockGroupsByBlockPackIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    return await localDB.query.BlockGroup.findMany({
      where: and(
        eq(BlockGroup.blockPackId, request.param.blockPackId),
        BlockGroupLocalSimulator.getPassPermissionCheckSQL(
          localDB,
          loggedInUser.publicId,
          [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ],
          request.param.blockPackId
        )
      ),
    });
  };

  static simulateInsertBlockGroupByBlockPackId = async (
    request: InsertBlockGroupByBlockPackIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const blockGroupId = request.body.blockGroupId ?? generateUUID();
      request.body.blockGroupId = blockGroupId;

      await tx.insert(BlockGroup).values({
        id: blockGroupId,
        ownerPublicId: loggedInUser.publicId,
        blockPackId: request.body.blockPackId,
        prevBlockGroupId: request.body.prevBlockGroupId,
      });

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateInsertBlockGroupsByBlockPackId = async (
    request: InsertBlockGroupsByBlockPackIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const rows = request.body.blockPackContents.map(content => {
        const blockGroupId = content.blockGroupId ?? generateUUID();
        content.blockGroupId = blockGroupId;

        return {
          id: blockGroupId,
          ownerPublicId: loggedInUser.publicId,
          blockPackId: request.body.blockPackId,
          prevBlockGroupId: content.prevBlockGroupId,
        };
      });

      await tx.insert(BlockGroup).values(rows);

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateBatchInsertBlockGroupsByBlockPackIds = async (
    request: BatchInsertBlockGroupsByBlockPackIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const rows = request.body.blockPackContents.map(content => {
        const blockGroupId = content.blockGroupId ?? generateUUID();
        content.blockGroupId = blockGroupId;

        return {
          id: blockGroupId,
          ownerPublicId: loggedInUser.publicId,
          blockPackId: content.blockPackId,
          prevBlockGroupId: content.prevBlockGroupId,
        };
      });

      await tx.insert(BlockGroup).values(rows);

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateInsertBlockGroupAndItsBlocksByBlockPackId = async (
    request: InsertBlockGroupAndItsBlocksByBlockPackIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const blockGroupId = request.body.blockGroupId ?? generateUUID();
      request.body.blockGroupId = blockGroupId;

      const flattenedBlocks = EditableBlockManipulator.flatten(
        request.body.arborizedEditableBlock
      );
      const blockRecords = flattenedBlocks.map(flattenedBlock => ({
        id: flattenedBlock.id,
        parentBlockId: flattenedBlock.parentBlockId,
        blockGroupId,
        type: flattenedBlock.type,
        props: flattenedBlock.props,
        content: flattenedBlock.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await tx.insert(BlockGroup).values({
        id: blockGroupId,
        ownerPublicId: loggedInUser.publicId,
        blockPackId: request.body.blockPackId,
        prevBlockGroupId: request.body.prevBlockGroupId,
        size: blockRecords.length,
      });

      if (blockRecords.length > 0) {
        await tx.insert(Block).values(blockRecords);
      }

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${blockRecords.length}`,
          updatedAt: new Date(),
        })
        .where(eq(BlockPack.id, request.body.blockPackId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateInsertBlockGroupsAndTheirBlocksByBlockPackId = async (
    request: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      let insertedBlockCount = 0;

      for (const content of request.body.blockGroupContents) {
        const blockGroupId = content.blockGroupId ?? generateUUID();
        content.blockGroupId = blockGroupId;

        const flattenedBlocks = EditableBlockManipulator.flatten(
          content.arborizedEditableBlock
        );
        const blockRecords = flattenedBlocks.map(flattenedBlock => ({
          id: flattenedBlock.id,
          parentBlockId: flattenedBlock.parentBlockId,
          blockGroupId,
          type: flattenedBlock.type,
          props: flattenedBlock.props,
          content: flattenedBlock.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.insert(BlockGroup).values({
          id: blockGroupId,
          ownerPublicId: loggedInUser.publicId,
          blockPackId: request.body.blockPackId,
          prevBlockGroupId: content.prevBlockGroupId,
          size: blockRecords.length,
        });

        if (blockRecords.length > 0) {
          insertedBlockCount += blockRecords.length;
          await tx.insert(Block).values(blockRecords);
        }
      }

      if (insertedBlockCount > 0) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${insertedBlockCount}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, request.body.blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateBatchInsertBlockGroupsAndTheirBlocksByBlockPackIds = async (
    request: BatchInsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const blockPackIdToCountMap = new Map<string, number>();

      for (const content of request.body.blockGroupContents) {
        const blockGroupId = content.blockGroupId ?? generateUUID();
        content.blockGroupId = blockGroupId;

        const flattenedBlocks = EditableBlockManipulator.flatten(
          content.arborizedEditableBlock
        );
        const blockRecords = flattenedBlocks.map(flattenedBlock => ({
          id: flattenedBlock.id,
          parentBlockId: flattenedBlock.parentBlockId,
          blockGroupId,
          type: flattenedBlock.type,
          props: flattenedBlock.props,
          content: flattenedBlock.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.insert(BlockGroup).values({
          id: blockGroupId,
          ownerPublicId: loggedInUser.publicId,
          blockPackId: content.blockPackId,
          prevBlockGroupId: content.prevBlockGroupId,
          size: blockRecords.length,
        });

        if (blockRecords.length > 0) {
          await tx.insert(Block).values(blockRecords);
          blockPackIdToCountMap.set(
            content.blockPackId,
            (blockPackIdToCountMap.get(content.blockPackId) ?? 0) +
              blockRecords.length
          );
        }
      }

      for (const [blockPackId, count] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId = async (
    request: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      let prevBlockGroupId = request.body.prevBlockGroupId;
      let insertedBlockCount = 0;

      for (const arborizedEditableBlock of request.body.arborizedEditableBlocks) {
        const blockGroupId = generateUUID();

        const flattenedBlocks = EditableBlockManipulator.flatten(
          arborizedEditableBlock
        );
        const blockRecords = flattenedBlocks.map(flattenedBlock => ({
          id: flattenedBlock.id,
          parentBlockId: flattenedBlock.parentBlockId,
          blockGroupId,
          type: flattenedBlock.type,
          props: flattenedBlock.props,
          content: flattenedBlock.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.insert(BlockGroup).values({
          id: blockGroupId,
          ownerPublicId: loggedInUser.publicId,
          blockPackId: request.body.blockPackId,
          prevBlockGroupId,
          size: blockRecords.length,
        });

        if (blockRecords.length > 0) {
          insertedBlockCount += blockRecords.length;
          await tx.insert(Block).values(blockRecords);
        }

        prevBlockGroupId = blockGroupId;
      }

      if (insertedBlockCount > 0) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${insertedBlockCount}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, request.body.blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.CREATE,
        body: request.body,
      });
    });
  };

  static simulateMoveMyBlockGroupById = async (
    request: MoveMyBlockGroupByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockGroup)
        .set({
          prevBlockGroupId: request.body.destinationBlockGroupId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(BlockGroup.id, request.body.movableBlockGroupId),
            eq(BlockGroup.blockPackId, request.body.blockPackId),
            BlockGroupLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              request.body.blockPackId
            )
          )
        );

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.MOVE,
        body: request.body,
      });
    });
  };

  static simulateMoveMyBlockGroupsByIds = async (
    request: MoveMyBlockGroupsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(BlockGroup)
        .set({
          prevBlockGroupId: request.body.destinationBlockGroupId,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(BlockGroup.id, request.body.movableBlockGroupIds),
            eq(BlockGroup.blockPackId, request.body.blockPackId),
            BlockGroupLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              request.body.blockPackId
            )
          )
        );

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.MOVE,
        body: request.body,
      });
    });
  };

  static simulateBatchMoveMyBlockGroupsByIds = async (
    request: BatchMoveMyBlockGroupsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const moved of request.body.movedBlockGroups) {
        await tx
          .update(BlockGroup)
          .set({
            prevBlockGroupId: moved.destinationBlockGroupId,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(BlockGroup.id, moved.movableBlockGroupId),
              eq(BlockGroup.blockPackId, moved.blockPackId)
            )
          );
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.MOVE,
        body: request.body,
      });
    });
  };

  static simulateRestoreMyBlockGroupById = async (
    request: RestoreMyBlockGroupByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const targetBlockGroup = await tx.query.BlockGroup.findFirst({
        where: eq(BlockGroup.id, request.body.blockGroupId),
        columns: {
          blockPackId: true,
          size: true,
          deletedAt: true,
        },
      });

      await tx
        .update(BlockGroup)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(BlockGroup.id, request.body.blockGroupId),
            BlockGroupLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        );

      if (targetBlockGroup && targetBlockGroup.deletedAt !== null) {
        await tx
          .update(Block)
          .set({
            deletedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(Block.blockGroupId, request.body.blockGroupId));

        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${targetBlockGroup.size}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, targetBlockGroup.blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
      });
    });
  };

  static simulateRestoreMyBlockGroupsByIds = async (
    request: RestoreMyBlockGroupsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const targetBlockGroups = await tx.query.BlockGroup.findMany({
        where: inArray(BlockGroup.id, request.body.blockGroupIds),
        columns: {
          id: true,
          blockPackId: true,
          size: true,
          deletedAt: true,
        },
      });

      await tx
        .update(BlockGroup)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(BlockGroup.id, request.body.blockGroupIds),
            BlockGroupLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        );

      await tx
        .update(Block)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(inArray(Block.blockGroupId, request.body.blockGroupIds));

      const blockPackIdToCountMap = new Map<string, number>();
      for (const targetBlockGroup of targetBlockGroups) {
        if (targetBlockGroup.deletedAt === null) continue;
        blockPackIdToCountMap.set(
          targetBlockGroup.blockPackId,
          (blockPackIdToCountMap.get(targetBlockGroup.blockPackId) ?? 0) +
            targetBlockGroup.size
        );
      }
      for (const [blockPackId, size] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${size}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
      });
    });
  };

  static simulateDeleteMyBlockGroupById = async (
    request: DeleteMyBlockGroupByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const targetBlockGroup = await tx.query.BlockGroup.findFirst({
        where: eq(BlockGroup.id, request.body.blockGroupId),
        columns: {
          size: true,
          deletedAt: true,
        },
      });

      await tx
        .update(BlockGroup)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(BlockGroup.id, request.body.blockGroupId),
            BlockGroupLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin],
              request.affected.blockPackId
            )
          )
        );

      await tx
        .update(Block)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(Block.blockGroupId, request.body.blockGroupId));

      const size = targetBlockGroup?.deletedAt === null ? targetBlockGroup.size : 0;
      if (size > 0) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`max(0, ${BlockPack.blockCount} - ${size})`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, request.affected.blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyBlockGroupsByIds = async (
    request: DeleteMyBlockGroupsByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const targetBlockGroups = await tx.query.BlockGroup.findMany({
        where: inArray(BlockGroup.id, request.body.blockGroupIds),
        columns: {
          id: true,
          blockPackId: true,
          size: true,
          deletedAt: true,
        },
      });

      await tx
        .update(BlockGroup)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(BlockGroup.id, request.body.blockGroupIds),
            BlockGroupLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
            ])
          )
        );

      await tx
        .update(Block)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(inArray(Block.blockGroupId, request.body.blockGroupIds));

      const blockPackIdToCountMap = new Map<string, number>();
      for (const targetBlockGroup of targetBlockGroups) {
        if (targetBlockGroup.deletedAt !== null) continue;
        blockPackIdToCountMap.set(
          targetBlockGroup.blockPackId,
          (blockPackIdToCountMap.get(targetBlockGroup.blockPackId) ?? 0) +
            targetBlockGroup.size
        );
      }
      for (const [blockPackId, size] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`max(0, ${BlockPack.blockCount} - ${size})`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.BlockGroup,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };
}
