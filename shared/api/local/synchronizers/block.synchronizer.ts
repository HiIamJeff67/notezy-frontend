import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlockByIdResponse,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsResponse,
  GetAllMyBlocksResponse,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsResponse,
  InsertBlockRequest,
  InsertBlockResponse,
  InsertBlocksRequest,
  InsertBlocksResponse,
  UpdateMyBlockByIdRequest,
  UpdateMyBlockByIdResponse,
  UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockPack,
  SubShelf,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { EditableBlockManipulator } from "@shared/lib/editableBlockManipulator";
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockLocalSynchronizer {
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

  static syncGetMyBlockById = async (
    response: GetMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(Block)
      .values({
        id: response.data.id,
        blockPackId: response.data.blockPackId,
        parentBlockId: response.data.parentBlockId,
        prevBlockId: response.data.prevBlockId,
        nextBlockId: response.data.nextBlockId,
        type: response.data.type,
        props: response.data.props as any,
        content: response.data.content as any,
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoUpdate({
        target: Block.id,
        set: {
          blockPackId: response.data.blockPackId,
          parentBlockId: response.data.parentBlockId,
          prevBlockId: response.data.prevBlockId,
          nextBlockId: response.data.nextBlockId,
          type: response.data.type,
          props: response.data.props as any,
          content: response.data.content as any,
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetMyBlocksByIds = async (
    response: GetMyBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const blocks = response.data.map(block => ({
      id: block.id,
      blockPackId: block.blockPackId,
      parentBlockId: block.parentBlockId,
      prevBlockId: block.prevBlockId,
      nextBlockId: block.nextBlockId,
      type: block.type,
      props: block.props as any,
      content: block.content as any,
      deletedAt: block.deletedAt,
      updatedAt: block.updatedAt,
      createdAt: block.createdAt,
    }));
    if (blocks.length === 0) return;

    await localDB
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
  };

  static syncGetMyBlocksByBlockPackId = async (
    response: GetMyBlocksByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const blocks = response.data.map(block => ({
      id: block.id,
      blockPackId: block.blockPackId,
      parentBlockId: block.parentBlockId,
      prevBlockId: block.prevBlockId,
      nextBlockId: block.nextBlockId,
      type: block.type,
      props: block.props as any,
      content: block.content as any,
      deletedAt: block.deletedAt,
      updatedAt: block.updatedAt,
      createdAt: block.createdAt,
    }));
    if (blocks.length === 0) return;

    await localDB
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
  };

  static syncGetAllMyBlocks = async (
    response: GetAllMyBlocksResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const blocks = response.data.map(block => ({
      id: block.id,
      blockPackId: block.blockPackId,
      parentBlockId: block.parentBlockId,
      prevBlockId: block.prevBlockId,
      nextBlockId: block.nextBlockId,
      type: block.type,
      props: block.props as any,
      content: block.content as any,
      deletedAt: block.deletedAt,
      updatedAt: block.updatedAt,
      createdAt: block.createdAt,
    }));
    if (blocks.length === 0) return;

    await localDB
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
  };

  static syncInsertBlock = async (
    request: InsertBlockRequest,
    response: InsertBlockResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const flattenedBlocks = EditableBlockManipulator.flatten(
        request.body.arborizedEditableBlock as any
      );
      if (flattenedBlocks.length === 0) return;

      const blockIdMap = new Map<string, string>();
      flattenedBlocks.forEach((block, index) => {
        blockIdMap.set(block.id, response.data.blockIds?.[index] ?? block.id);
      });

      const insertedBlocks = flattenedBlocks.map((block, index) => ({
        id: blockIdMap.get(block.id) ?? block.id,
        blockPackId: request.body.blockPackId,
        parentBlockId: block.parentBlockId
          ? blockIdMap.get(block.parentBlockId) ?? block.parentBlockId
          : request.body.parentBlockId ?? null,
        prevBlockId: index === 0 ? request.body.prevBlockId ?? null : null,
        nextBlockId: null,
        type: block.type,
        props: block.props as any,
        content: block.content as any,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      }));

      await tx.insert(Block).values(insertedBlocks).onConflictDoNothing();
      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${insertedBlocks.length}`,
          updatedAt: response.data.createdAt,
        })
        .where(eq(BlockPack.id, request.body.blockPackId));
    });
  };

  static syncInsertBlocks = async (
    request: InsertBlocksRequest,
    response: InsertBlocksResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const [successOrder, successIndex] of response.data.successIndexes.entries()) {
        const insertedBlock = request.body.insertedBlocks[successIndex];
        if (!insertedBlock) continue;

        const flattenedBlocks = EditableBlockManipulator.flatten(
          insertedBlock.arborizedEditableBlock as any
        );
        if (flattenedBlocks.length === 0) continue;

        const blockIds = response.data.successBlockPackAndBlockIds[successOrder]?.blockIds ?? [];
        const blockIdMap = new Map<string, string>();
        flattenedBlocks.forEach((block, index) => {
          blockIdMap.set(block.id, blockIds[index] ?? block.id);
        });

        const insertedBlocks = flattenedBlocks.map((block, index) => ({
          id: blockIdMap.get(block.id) ?? block.id,
          blockPackId: insertedBlock.blockPackId,
          parentBlockId: block.parentBlockId
            ? blockIdMap.get(block.parentBlockId) ?? block.parentBlockId
            : insertedBlock.parentBlockId ?? null,
          prevBlockId: index === 0 ? insertedBlock.prevBlockId ?? null : null,
          nextBlockId: null,
          type: block.type,
          props: block.props as any,
          content: block.content as any,
          deletedAt: null,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        }));

        await tx.insert(Block).values(insertedBlocks).onConflictDoNothing();
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${insertedBlocks.length}`,
            updatedAt: response.data.createdAt,
          })
          .where(eq(BlockPack.id, insertedBlock.blockPackId));
      }
    });
  };

  static syncUpdateMyBlockById = async (
    request: UpdateMyBlockByIdRequest,
    response: UpdateMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const existingBlock = await localDB.query.Block.findFirst({
      where: eq(Block.id, request.body.blockId),
    });

    const setValues: Partial<{
      blockPackId: string;
      parentBlockId: string | null;
      prevBlockId: string | null;
      type: string | null;
      props: unknown;
      content: unknown;
      updatedAt: Date;
    }> = { updatedAt: response.data.updatedAt };

    if (request.body.values.blockPackId !== undefined) setValues.blockPackId = request.body.values.blockPackId;
    if (request.body.values.parentBlockId !== undefined) setValues.parentBlockId = request.body.values.parentBlockId;
    if (request.body.values.prevBlockId !== undefined) setValues.prevBlockId = request.body.values.prevBlockId;
    if (request.body.values.type !== undefined && request.body.values.type !== null) setValues.type = request.body.values.type;
    if (request.body.values.props !== undefined) setValues.props = request.body.values.props;
    if (request.body.values.content !== undefined) setValues.content = request.body.values.content;
    if (request.body.setNull?.ParentBlockId) setValues.parentBlockId = null;
    if (request.body.setNull?.PrevBlockId) setValues.prevBlockId = null;

    await localDB.transaction(async tx => {
      await tx
        .update(Block)
        .set(setValues as any)
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );

      if (
        existingBlock?.blockPackId &&
        request.body.values.blockPackId &&
        existingBlock.blockPackId !== request.body.values.blockPackId
      ) {
        await tx
          .update(BlockPack)
          .set({ blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`, updatedAt: response.data.updatedAt })
          .where(eq(BlockPack.id, existingBlock.blockPackId));
        await tx
          .update(BlockPack)
          .set({ blockCount: sql`${BlockPack.blockCount} + 1`, updatedAt: response.data.updatedAt })
          .where(eq(BlockPack.id, request.body.values.blockPackId));
      }
    });
  };

  static syncUpdateMyBlocksByIds = async (
    request: UpdateMyBlocksByIdsRequest,
    response: UpdateMyBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const updatedBlock of request.body.updatedBlocks) {
        const existingBlock = await tx.query.Block.findFirst({
          where: eq(Block.id, updatedBlock.blockId),
        });

        const setValues: Partial<{
          blockPackId: string;
          parentBlockId: string | null;
          prevBlockId: string | null;
          type: string | null;
          props: unknown;
          content: unknown;
          updatedAt: Date;
        }> = { updatedAt: response.data.updatedAt };

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
              BlockLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );

        if (
          existingBlock?.blockPackId &&
          updatedBlock.values.blockPackId &&
          existingBlock.blockPackId !== updatedBlock.values.blockPackId
        ) {
          await tx
            .update(BlockPack)
            .set({ blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`, updatedAt: response.data.updatedAt })
            .where(eq(BlockPack.id, existingBlock.blockPackId));
          await tx
            .update(BlockPack)
            .set({ blockCount: sql`${BlockPack.blockCount} + 1`, updatedAt: response.data.updatedAt })
            .where(eq(BlockPack.id, updatedBlock.values.blockPackId));
        }
      }
    });
  };

  static syncDeleteMyBlockById = async (
    request: DeleteMyBlockByIdRequest,
    response: DeleteMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const existingBlock = await tx.query.Block.findFirst({
        where: eq(Block.id, request.body.blockId),
      });

      await tx
        .update(Block)
        .set({ deletedAt: response.data.deletedAt, updatedAt: response.data.deletedAt })
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      if (existingBlock?.blockPackId && existingBlock.deletedAt === null) {
        await tx
          .update(BlockPack)
          .set({ blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`, updatedAt: response.data.deletedAt })
          .where(eq(BlockPack.id, existingBlock.blockPackId));
      }
    });
  };

  static syncDeleteMyBlocksByIds = async (
    request: DeleteMyBlocksByIdsRequest,
    response: DeleteMyBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const existingBlocks = request.body.blockIds.length > 0
        ? await tx
            .select({ id: Block.id, blockPackId: Block.blockPackId, deletedAt: Block.deletedAt })
            .from(Block)
            .where(inArray(Block.id, request.body.blockIds))
        : [];

      if (request.body.blockIds.length > 0) {
        await tx
          .update(Block)
          .set({ deletedAt: response.data.deletedAt, updatedAt: response.data.deletedAt })
          .where(
            and(
              inArray(Block.id, request.body.blockIds),
              BlockLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [AccessControlPermission.Owner, AccessControlPermission.Admin]
              )
            )
          );
      }

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
          .set({ blockCount: sql`max(0, ${BlockPack.blockCount} - ${count})`, updatedAt: response.data.deletedAt })
          .where(eq(BlockPack.id, blockPackId));
      }
    });
  };
}
