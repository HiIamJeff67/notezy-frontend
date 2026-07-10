import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlocksByIdsRequest,
  GetAllMyBlocksRequest,
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
  InsertBlockRequest,
  InsertBlocksRequest,
  UpdateMyBlockByIdRequest,
  UpdateMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockPack,
  SubShelf,
  Transaction,
  User,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { TransactionActionType } from "@shared/api/local/schemas/enums/transaction_action_type.enum";
import { TransactionEntityType } from "@shared/api/local/schemas/enums/transaction_entity_type.enum";
import { EditableBlockManipulator } from "@shared/lib/editableBlockManipulator";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockLocalSimulator {
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
        .innerJoin(
          SubShelf,
          eq(SubShelf.rootShelfId, UsersToShelves.rootShelfId)
        )
        .innerJoin(BlockPack, eq(BlockPack.parentSubShelfId, SubShelf.id))
        .where(
          and(
            eq(UsersToShelves.userPublicId, userPublicId),
            inArray(UsersToShelves.permission, permissions),
            blockPackId ? eq(BlockPack.id, blockPackId) : eq(BlockPack.id, Block.blockPackId)
          )
        )
    );

  static simulateGetMyBlockById = async (request: GetMyBlockByIdRequest) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const blocks = await localDB
      .select({
        id: Block.id,
        blockPackId: Block.blockPackId,
        parentBlockId: Block.parentBlockId,
        prevBlockId: Block.prevBlockId,
        nextBlockId: Block.nextBlockId,
        type: Block.type,
        props: Block.props,
        content: Block.content,
        deletedAt: Block.deletedAt,
        updatedAt: Block.updatedAt,
        createdAt: Block.createdAt,
      })
      .from(Block)
      .where(
        and(
          eq(Block.id, request.param.blockId),
          BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ])
        )
      )
      .limit(1);

    return blocks[0] ?? null;
  };

  static simulateGetMyBlocksByIds = async (
    request: GetMyBlocksByIdsRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser || request.param.blockIds.length === 0) return [];

    return await localDB
      .select({
        id: Block.id,
        blockPackId: Block.blockPackId,
        parentBlockId: Block.parentBlockId,
        prevBlockId: Block.prevBlockId,
        nextBlockId: Block.nextBlockId,
        type: Block.type,
        props: Block.props,
        content: Block.content,
        deletedAt: Block.deletedAt,
        updatedAt: Block.updatedAt,
        createdAt: Block.createdAt,
      })
      .from(Block)
      .where(
        and(
          inArray(Block.id, request.param.blockIds),
          BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ])
        )
      );
  };

  static simulateGetMyBlocksByBlockPackId = async (
    request: GetMyBlocksByBlockPackIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    return await localDB
      .select({
        id: Block.id,
        blockPackId: Block.blockPackId,
        parentBlockId: Block.parentBlockId,
        prevBlockId: Block.prevBlockId,
        nextBlockId: Block.nextBlockId,
        type: Block.type,
        props: Block.props,
        content: Block.content,
        deletedAt: Block.deletedAt,
        updatedAt: Block.updatedAt,
        createdAt: Block.createdAt,
      })
      .from(Block)
      .where(
        and(
          eq(Block.blockPackId, request.param.blockPackId),
          BlockLocalSimulator.getPassPermissionCheckSQL(
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
        )
      );
  };

  static simulateGetAllMyBlocks = async (_request: GetAllMyBlocksRequest) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    return await localDB
      .select({
        id: Block.id,
        blockPackId: Block.blockPackId,
        parentBlockId: Block.parentBlockId,
        prevBlockId: Block.prevBlockId,
        nextBlockId: Block.nextBlockId,
        type: Block.type,
        props: Block.props,
        content: Block.content,
        deletedAt: Block.deletedAt,
        updatedAt: Block.updatedAt,
        createdAt: Block.createdAt,
      })
      .from(Block)
      .where(
        BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
          AccessControlPermission.Read,
          AccessControlPermission.Write,
          AccessControlPermission.Admin,
          AccessControlPermission.Owner,
        ])
      );
  };

  static simulateInsertBlock = async (
    request: InsertBlockRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const canWrite = await tx
        .select({ id: BlockPack.id })
        .from(BlockPack)
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockLocalSimulator.getPassPermissionCheckSQL(
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
        )
        .limit(1);
      if (!canWrite[0]) return;

      const flattenedBlocks = EditableBlockManipulator.flatten(
        request.body.arborizedEditableBlock as any
      );
      if (flattenedBlocks.length === 0) return;

      const insertedBlocks = flattenedBlocks.map((block, index) => ({
        id: block.id,
        blockPackId: request.body.blockPackId,
        parentBlockId: block.parentBlockId ?? request.body.parentBlockId ?? null,
        prevBlockId: index === 0 ? request.body.prevBlockId ?? null : null,
        nextBlockId: null,
        type: block.type,
        props: block.props as any,
        content: block.content as any,
        deletedAt: null,
        updatedAt: new Date(),
        createdAt: new Date(),
      }));

      await tx
        .insert(Block)
        .values(insertedBlocks)
        .onConflictDoUpdate({
          target: Block.id,
          set: {
            blockPackId: sql`excluded.block_pack_id`,
            parentBlockId: sql`excluded.parent_block_id`,
            prevBlockId: sql`excluded.prev_block_id`,
            nextBlockId: sql`excluded.next_block_id`,
            type: sql`excluded.type`,
            props: sql`excluded.props`,
            content: sql`excluded.content`,
            deletedAt: sql`excluded.deleted_at`,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${insertedBlocks.length}`,
          updatedAt: new Date(),
        })
        .where(eq(BlockPack.id, request.body.blockPackId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateInsertBlocks = async (
    request: InsertBlocksRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const insertedBlock of request.body.insertedBlocks) {
        const canWrite = await tx
          .select({ id: BlockPack.id })
          .from(BlockPack)
          .where(
            and(
              eq(BlockPack.id, insertedBlock.blockPackId),
              BlockLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                insertedBlock.blockPackId
              )
            )
          )
          .limit(1);
        if (!canWrite[0]) continue;

        const flattenedBlocks = EditableBlockManipulator.flatten(
          insertedBlock.arborizedEditableBlock as any
        );
        if (flattenedBlocks.length === 0) continue;

        const blocks = flattenedBlocks.map((block, index) => ({
          id: block.id,
          blockPackId: insertedBlock.blockPackId,
          parentBlockId: block.parentBlockId ?? insertedBlock.parentBlockId ?? null,
          prevBlockId: index === 0 ? insertedBlock.prevBlockId ?? null : null,
          nextBlockId: null,
          type: block.type,
          props: block.props as any,
          content: block.content as any,
          deletedAt: null,
          updatedAt: new Date(),
          createdAt: new Date(),
        }));

        await tx
          .insert(Block)
          .values(blocks)
          .onConflictDoUpdate({
            target: Block.id,
            set: {
              blockPackId: sql`excluded.block_pack_id`,
              parentBlockId: sql`excluded.parent_block_id`,
              prevBlockId: sql`excluded.prev_block_id`,
              nextBlockId: sql`excluded.next_block_id`,
              type: sql`excluded.type`,
              props: sql`excluded.props`,
              content: sql`excluded.content`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });

        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${blocks.length}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockPack.id, insertedBlock.blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.CREATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyBlockById = async (
    request: UpdateMyBlockByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const setValues: Partial<{
        blockPackId: string;
        parentBlockId: string | null;
        prevBlockId: string | null;
        type: string | null;
        props: unknown;
        content: unknown;
        updatedAt: Date;
      }> = { updatedAt: new Date() };

      if (request.body.values.blockPackId !== undefined) setValues.blockPackId = request.body.values.blockPackId;
      if (request.body.values.parentBlockId !== undefined) setValues.parentBlockId = request.body.values.parentBlockId;
      if (request.body.values.prevBlockId !== undefined) setValues.prevBlockId = request.body.values.prevBlockId;
      if (request.body.values.type !== undefined && request.body.values.type !== null) setValues.type = request.body.values.type;
      if (request.body.values.props !== undefined) setValues.props = request.body.values.props;
      if (request.body.values.content !== undefined) setValues.content = request.body.values.content;
      if (request.body.setNull?.ParentBlockId) setValues.parentBlockId = null;
      if (request.body.setNull?.PrevBlockId) setValues.prevBlockId = null;

      await tx
        .update(Block)
        .set(setValues as any)
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
          )
        );

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateUpdateMyBlocksByIds = async (
    request: UpdateMyBlocksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const updatedBlock of request.body.updatedBlocks) {
        const setValues: Partial<{
          blockPackId: string;
          parentBlockId: string | null;
          prevBlockId: string | null;
          type: string | null;
          props: unknown;
          content: unknown;
          updatedAt: Date;
        }> = { updatedAt: new Date() };

        if (updatedBlock.values.blockPackId !== undefined) setValues.blockPackId = updatedBlock.values.blockPackId;
        if (updatedBlock.values.parentBlockId !== undefined) setValues.parentBlockId = updatedBlock.values.parentBlockId;
        if (updatedBlock.values.prevBlockId !== undefined) setValues.prevBlockId = updatedBlock.values.prevBlockId;
        if (updatedBlock.values.type !== undefined && updatedBlock.values.type !== null) setValues.type = updatedBlock.values.type;
        if (updatedBlock.values.props !== undefined) setValues.props = updatedBlock.values.props;
        if (updatedBlock.values.content !== undefined) setValues.content = updatedBlock.values.content;
        if (updatedBlock.setNull?.ParentBlockId) setValues.parentBlockId = null;
        if (updatedBlock.setNull?.PrevBlockId) setValues.prevBlockId = null;

        await tx
          .update(Block)
          .set(setValues as any)
          .where(
            and(
              eq(Block.id, updatedBlock.blockId),
              BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
            )
          );
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.UPDATE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyBlockById = async (
    request: DeleteMyBlockByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const existingBlock = await tx.query.Block.findFirst({
        where: eq(Block.id, request.body.blockId),
      });

      await tx
        .update(Block)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
            ])
          )
        );

      if (existingBlock?.blockPackId && existingBlock.deletedAt === null) {
        await tx
          .update(BlockPack)
          .set({ blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`, updatedAt: new Date() })
          .where(eq(BlockPack.id, existingBlock.blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateDeleteMyBlocksByIds = async (
    request: DeleteMyBlocksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser || request.body.blockIds.length === 0) return;

      const existingBlocks = await tx
        .select({ id: Block.id, blockPackId: Block.blockPackId, deletedAt: Block.deletedAt })
        .from(Block)
        .where(inArray(Block.id, request.body.blockIds));

      await tx
        .update(Block)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            inArray(Block.id, request.body.blockIds),
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
            ])
          )
        );

      const blockPackIdToCountMap = new Map<string, number>();
      for (const block of existingBlocks) {
        if (block.deletedAt !== null) continue;
        blockPackIdToCountMap.set(
          block.blockPackId,
          (blockPackIdToCountMap.get(block.blockPackId) ?? 0) + 1
        );
      }

      for (const [blockPackId, count] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({ blockCount: sql`max(0, ${BlockPack.blockCount} - ${count})`, updatedAt: new Date() })
          .where(eq(BlockPack.id, blockPackId));
      }

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.DELETE,
        body: request.body,
        affected: request.affected,
      });
    });
  };
}
