import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlockByIdResponse,
  DeleteMyBlocksByIdsRequest,
  DeleteMyBlocksByIdsResponse,
  GetAllMyBlocksResponse,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdResponse,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockGroupIdsResponse,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsResponse,
  InsertBlockRequest,
  InsertBlockResponse,
  InsertBlocksRequest,
  InsertBlocksResponse,
  RestoreMyBlockByIdRequest,
  RestoreMyBlockByIdResponse,
  RestoreMyBlocksByIdsRequest,
  RestoreMyBlocksByIdsResponse,
  UpdateMyBlockByIdRequest,
  UpdateMyBlockByIdResponse,
  UpdateMyBlocksByIdsRequest,
  UpdateMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockGroup,
  BlockPack,
  SubShelf,
  UsersToShelves,
} from "@shared/api/local/schemas";
import { EditableBlockManipulator } from "@shared/lib/editableBlockManipulator";
import { and, eq, exists, inArray, SQL, sql } from "drizzle-orm";
import { JSONType } from "zod";

export class BlockLocalSynchronizer {
  private static getPassPermissionCheckSQL = (
    queryBuilder: Pick<typeof localDB, "select">,
    userPublicId: string,
    permissions: AccessControlPermission[],
    blockGroupId?: string
  ): SQL =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToShelves)
        .innerJoin(
          SubShelf,
          eq(SubShelf.rootShelfId, UsersToShelves.rootShelfId)
        )
        .innerJoin(BlockPack, eq(BlockPack.parentSubShelfId, SubShelf.id))
        .innerJoin(BlockGroup, eq(BlockGroup.blockPackId, BlockPack.id))
        .where(
          and(
            eq(UsersToShelves.userPublicId, userPublicId),
            inArray(UsersToShelves.permission, permissions),
            blockGroupId
              ? eq(BlockGroup.id, blockGroupId)
              : eq(BlockGroup.id, Block.blockGroupId)
          )
        )
    );

  private static applyBlockGroupSizeDeltas = async (
    tx: any,
    blockGroupIdToDeltaMap: Map<string, number>,
    updatedAt: Date
  ): Promise<void> => {
    if (blockGroupIdToDeltaMap.size === 0) return;

    const ids = Array.from(blockGroupIdToDeltaMap.keys());
    const cases = ids.map(id => {
      const delta = blockGroupIdToDeltaMap.get(id) ?? 0;
      return sql`WHEN ${BlockGroup.id} = ${id} THEN max(0, ${BlockGroup.size} + ${delta})`;
    });

    await tx
      .update(BlockGroup)
      .set({
        size: sql`CASE ${sql.join(cases, sql` `)} ELSE ${BlockGroup.size} END`,
        updatedAt,
      })
      .where(inArray(BlockGroup.id, ids));
  };

  private static applyBlockPackCountDeltas = async (
    tx: any,
    blockPackIdToDeltaMap: Map<string, number>,
    updatedAt: Date
  ): Promise<void> => {
    if (blockPackIdToDeltaMap.size === 0) return;

    const ids = Array.from(blockPackIdToDeltaMap.keys());
    const cases = ids.map(id => {
      const delta = blockPackIdToDeltaMap.get(id) ?? 0;
      return sql`WHEN ${BlockPack.id} = ${id} THEN max(0, ${BlockPack.blockCount} + ${delta})`;
    });

    await tx
      .update(BlockPack)
      .set({
        blockCount: sql`CASE ${sql.join(cases, sql` `)} ELSE ${BlockPack.blockCount} END`,
        updatedAt,
      })
      .where(inArray(BlockPack.id, ids));
  };

  static syncGetMyBlockById = async (
    response: GetMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(Block)
      .values({
        id: response.data.id,
        parentBlockId: response.data.parentBlockId,
        blockGroupId: response.data.blockGroupId,
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
          parentBlockId: response.data.parentBlockId,
          blockGroupId: response.data.blockGroupId,
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

    await localDB
      .insert(Block)
      .values(
        response.data.map(block => ({
          id: block.id,
          parentBlockId: block.parentBlockId,
          blockGroupId: block.blockGroupId,
          type: block.type,
          props: block.props as any,
          content: block.content as any,
          deletedAt: block.deletedAt,
          updatedAt: block.updatedAt,
          createdAt: block.createdAt,
        }))
      )
      .onConflictDoUpdate({
        target: Block.id,
        set: {
          parentBlockId: sql`excluded.parent_block_id`,
          blockGroupId: sql`excluded.block_group_id`,
          type: sql`excluded.type`,
          props: sql`excluded.props`,
          content: sql`excluded.content`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetMyBlocksByBlockGroupId = async (
    request: GetMyBlocksByBlockGroupIdRequest,
    response: GetMyBlocksByBlockGroupIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const flattenedBlocks = EditableBlockManipulator.flatten(
      response.data.rawArborizedEditableBlock
    );
    const insertedBlocks = flattenedBlocks.map(flattenedBlock => ({
      id: flattenedBlock.id,
      parentBlockId: flattenedBlock.parentBlockId,
      blockGroupId: request.param.blockGroupId,
      type: flattenedBlock.type,
      props: flattenedBlock.props,
      content: flattenedBlock.content,
    }));

    await localDB.transaction(async tx => {
      await tx
        .delete(Block)
        .where(eq(Block.blockGroupId, request.param.blockGroupId));

      if (insertedBlocks.length > 0) {
        await tx
          .insert(Block)
          .values(insertedBlocks)
          .onConflictDoUpdate({
            target: Block.id,
            set: {
              parentBlockId: sql`excluded.parent_block_id`,
              blockGroupId: sql`excluded.block_group_id`,
              type: sql`excluded.type`,
              props: sql`excluded.props`,
              content: sql`excluded.content`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      await tx
        .update(BlockGroup)
        .set({
          size: insertedBlocks.length,
          updatedAt: new Date(),
        })
        .where(eq(BlockGroup.id, request.param.blockGroupId));
    });
  };

  static syncGetMyBlocksByBlockGroupIds = async (
    request: GetMyBlocksByBlockGroupIdsRequest,
    response: GetMyBlocksByBlockGroupIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const blockGroupIds = request.param.blockGroupIds.filter(
      (id): id is string => Boolean(id)
    );
    const blockGroupIdToSizeMap = new Map<string, number>();
    const blocks: Array<typeof Block.$inferInsert> = [];

    for (const [index, blockGroupId] of request.param.blockGroupIds.entries()) {
      if (!blockGroupId) continue;

      const responseItem = response.data[index];
      const flattenedBlocks = EditableBlockManipulator.flatten(
        responseItem?.rawArborizedEditableBlock
      );
      const blocksInGroup = flattenedBlocks.map(flattenedBlock => ({
        id: flattenedBlock.id,
        parentBlockId: flattenedBlock.parentBlockId,
        blockGroupId,
        type: flattenedBlock.type,
        props: flattenedBlock.props,
        content: flattenedBlock.content,
      }));

      blocks.push(...blocksInGroup);
      blockGroupIdToSizeMap.set(blockGroupId, blocksInGroup.length);
    }

    await localDB.transaction(async tx => {
      if (blockGroupIds.length > 0) {
        await tx
          .delete(Block)
          .where(inArray(Block.blockGroupId, blockGroupIds));
      }

      if (blocks.length > 0) {
        await tx
          .insert(Block)
          .values(blocks)
          .onConflictDoUpdate({
            target: Block.id,
            set: {
              parentBlockId: sql`excluded.parent_block_id`,
              blockGroupId: sql`excluded.block_group_id`,
              type: sql`excluded.type`,
              props: sql`excluded.props`,
              content: sql`excluded.content`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      if (blockGroupIdToSizeMap.size > 0) {
        const targetIds = Array.from(blockGroupIdToSizeMap.keys());
        const sizeCases = targetIds.map(blockGroupId => {
          const size = blockGroupIdToSizeMap.get(blockGroupId) ?? 0;
          return sql`WHEN ${BlockGroup.id} = ${blockGroupId} THEN ${size}`;
        });

        await tx
          .update(BlockGroup)
          .set({
            size: sql`CASE ${sql.join(sizeCases, sql` `)} ELSE ${BlockGroup.size} END`,
            updatedAt: new Date(),
          })
          .where(inArray(BlockGroup.id, targetIds));
      }
    });
  };

  static syncGetMyBlocksByBlockPackId = async (
    response: GetMyBlocksByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(Block)
      .values(
        response.data.map(block => ({
          id: block.id,
          parentBlockId: block.parentBlockId,
          blockGroupId: block.blockGroupId,
          type: block.type,
          props: block.props as any,
          content: block.content as any,
          deletedAt: block.deletedAt,
          updatedAt: block.updatedAt,
          createdAt: block.createdAt,
        }))
      )
      .onConflictDoUpdate({
        target: Block.id,
        set: {
          parentBlockId: sql`excluded.parent_block_id`,
          blockGroupId: sql`excluded.block_group_id`,
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

    await localDB
      .insert(Block)
      .values(
        response.data.map(block => ({
          id: block.id,
          parentBlockId: block.parentBlockId,
          blockGroupId: block.blockGroupId,
          type: block.type,
          props: block.props as any,
          content: block.content as any,
          deletedAt: block.deletedAt,
          updatedAt: block.updatedAt,
          createdAt: block.createdAt,
        }))
      )
      .onConflictDoUpdate({
        target: Block.id,
        set: {
          parentBlockId: sql`excluded.parent_block_id`,
          blockGroupId: sql`excluded.block_group_id`,
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

    const flattenedBlocks = EditableBlockManipulator.flatten(
      request.body.arborizedEditableBlock
    );
    const blocks = flattenedBlocks.map(flattenedBlock => ({
      id: flattenedBlock.id,
      parentBlockId: flattenedBlock.parentBlockId,
      blockGroupId: request.body.blockGroupId,
      type: flattenedBlock.type,
      props: flattenedBlock.props,
      content: flattenedBlock.content,
      createdAt: response.data.createdAt,
      updatedAt: response.data.createdAt,
    }));

    await localDB.transaction(async tx => {
      if (blocks.length > 0) {
        await tx
          .insert(Block)
          .values(blocks)
          .onConflictDoUpdate({
            target: Block.id,
            set: {
              parentBlockId: sql`excluded.parent_block_id`,
              blockGroupId: sql`excluded.block_group_id`,
              type: sql`excluded.type`,
              props: sql`excluded.props`,
              content: sql`excluded.content`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      await tx
        .update(BlockGroup)
        .set({
          size: sql`${BlockGroup.size} + ${blocks.length}`,
          updatedAt: response.data.createdAt,
        })
        .where(eq(BlockGroup.id, request.body.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${blocks.length}`,
          updatedAt: response.data.createdAt,
        })
        .where(
          and(
            eq(BlockPack.id, request.affected.blockPackId),
            BlockLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              request.body.blockGroupId
            )
          )
        );
    });
  };

  static syncInsertBlocks = async (
    request: InsertBlocksRequest,
    response: InsertBlocksResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const blockPackIdToCountMap = new Map<string, number>();
      const blockGroupIdToCountMap = new Map<string, number>();
      const insertedBlocks: Array<typeof Block.$inferInsert> = [];

      for (const successIndex of response.data.successIndexes) {
        const insertedBlock = request.body.insertedBlocks[successIndex];
        if (!insertedBlock) continue;

        const flattenedBlocks = EditableBlockManipulator.flatten(
          insertedBlock.arborizedEditableBlock
        );
        const blocks = flattenedBlocks.map(flattenedBlock => ({
          id: flattenedBlock.id,
          parentBlockId: flattenedBlock.parentBlockId,
          blockGroupId: insertedBlock.blockGroupId,
          type: flattenedBlock.type,
          props: flattenedBlock.props,
          content: flattenedBlock.content,
          createdAt: response.data.createdAt,
          updatedAt: response.data.createdAt,
        }));

        insertedBlocks.push(...blocks);

        blockGroupIdToCountMap.set(
          insertedBlock.blockGroupId,
          (blockGroupIdToCountMap.get(insertedBlock.blockGroupId) ?? 0) +
            blocks.length
        );

        const blockPackId = request.affected.blockPackIds[successIndex];
        if (blockPackId) {
          blockPackIdToCountMap.set(
            blockPackId,
            (blockPackIdToCountMap.get(blockPackId) ?? 0) + blocks.length
          );
        }
      }

      if (insertedBlocks.length > 0) {
        await tx
          .insert(Block)
          .values(insertedBlocks)
          .onConflictDoUpdate({
            target: Block.id,
            set: {
              parentBlockId: sql`excluded.parent_block_id`,
              blockGroupId: sql`excluded.block_group_id`,
              type: sql`excluded.type`,
              props: sql`excluded.props`,
              content: sql`excluded.content`,
              deletedAt: sql`excluded.deleted_at`,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      await BlockLocalSynchronizer.applyBlockGroupSizeDeltas(
        tx,
        blockGroupIdToCountMap,
        response.data.createdAt
      );
      await BlockLocalSynchronizer.applyBlockPackCountDeltas(
        tx,
        blockPackIdToCountMap,
        response.data.createdAt
      );
    });
  };

  static syncUpdateMyBlockById = async (
    request: UpdateMyBlockByIdRequest,
    response: UpdateMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const setValues: Partial<{
      parentBlockId: string | null;
      blockGroupId: string;
      type: string;
      props: JSONType;
      content: JSONType[];
      updatedAt: Date;
    }> = {
      updatedAt: response.data.updatedAt,
    };

    if (request.body.values.parentBlockId !== undefined) {
      setValues.parentBlockId = request.body.values.parentBlockId;
    }
    if (request.body.values.blockGroupId !== undefined) {
      setValues.blockGroupId = request.body.values.blockGroupId;
    }
    if (request.body.values.type !== undefined) {
      setValues.type = request.body.values.type ?? "paragraph";
    }
    if (request.body.values.props !== undefined) {
      setValues.props = request.body.values.props as any;
    }
    if (request.body.values.content !== undefined) {
      setValues.content = request.body.values.content as any;
    }
    if (request.body.setNull?.parentBlockId) {
      setValues.parentBlockId = null;
    }

    await localDB.transaction(async tx => {
      const existing = await tx.query.Block.findFirst({
        where: eq(Block.id, request.body.blockId),
        columns: {
          blockGroupId: true,
        },
      });

      await tx
        .update(Block)
        .set(setValues)
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

      const sourceBlockGroupId =
        existing?.blockGroupId ?? request.affected.blockGroupId;
      const destinationBlockGroupId = request.body.values.blockGroupId;
      if (
        destinationBlockGroupId &&
        sourceBlockGroupId &&
        destinationBlockGroupId !== sourceBlockGroupId
      ) {
        await tx
          .update(BlockGroup)
          .set({
            size: sql`max(0, ${BlockGroup.size} - 1)`,
            updatedAt: response.data.updatedAt,
          })
          .where(eq(BlockGroup.id, sourceBlockGroupId));

        await tx
          .update(BlockGroup)
          .set({
            size: sql`${BlockGroup.size} + 1`,
            updatedAt: response.data.updatedAt,
          })
          .where(eq(BlockGroup.id, destinationBlockGroupId));

        const affectedBlockGroups = await tx
          .select({
            id: BlockGroup.id,
            blockPackId: BlockGroup.blockPackId,
          })
          .from(BlockGroup)
          .where(
            inArray(BlockGroup.id, [
              sourceBlockGroupId,
              destinationBlockGroupId,
            ])
          );
        const sourceBlockPackId = affectedBlockGroups.find(
          item => item.id === sourceBlockGroupId
        )?.blockPackId;
        const destinationBlockPackId = affectedBlockGroups.find(
          item => item.id === destinationBlockGroupId
        )?.blockPackId;

        if (
          sourceBlockPackId &&
          destinationBlockPackId &&
          sourceBlockPackId !== destinationBlockPackId
        ) {
          await tx
            .update(BlockPack)
            .set({
              blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`,
              updatedAt: response.data.updatedAt,
            })
            .where(eq(BlockPack.id, sourceBlockPackId));
          await tx
            .update(BlockPack)
            .set({
              blockCount: sql`${BlockPack.blockCount} + 1`,
              updatedAt: response.data.updatedAt,
            })
            .where(eq(BlockPack.id, destinationBlockPackId));
        }
      }
    });
  };

  static syncUpdateMyBlocksByIds = async (
    request: UpdateMyBlocksByIdsRequest,
    response: UpdateMyBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const blockIds = request.body.updatedBlocks.map(item => item.blockId);
    if (blockIds.length === 0) return;

    await localDB.transaction(async tx => {
      const existingBlocks = await tx
        .select({
          id: Block.id,
          blockGroupId: Block.blockGroupId,
        })
        .from(Block)
        .where(inArray(Block.id, blockIds));
      const currentBlockGroupByBlockId = new Map(
        existingBlocks.map(item => [item.id, item.blockGroupId])
      );

      const parentBlockCases: SQL[] = [];
      const blockGroupCases: SQL[] = [];
      const typeCases: SQL[] = [];
      const propsCases: SQL[] = [];
      const contentCases: SQL[] = [];
      const movedBlockGroupDeltas = new Map<string, number>();

      for (const updatedBlock of request.body.updatedBlocks) {
        const blockId = updatedBlock.blockId;

        if (updatedBlock.setNull?.parentBlockId) {
          parentBlockCases.push(sql`WHEN ${Block.id} = ${blockId} THEN NULL`);
        } else if (updatedBlock.values.parentBlockId !== undefined) {
          parentBlockCases.push(
            sql`WHEN ${Block.id} = ${blockId} THEN ${updatedBlock.values.parentBlockId}`
          );
        }

        if (updatedBlock.values.blockGroupId !== undefined) {
          blockGroupCases.push(
            sql`WHEN ${Block.id} = ${blockId} THEN ${updatedBlock.values.blockGroupId}`
          );
        }
        if (updatedBlock.values.type !== undefined) {
          typeCases.push(
            sql`WHEN ${Block.id} = ${blockId} THEN ${updatedBlock.values.type ?? "paragraph"}`
          );
        }
        if (updatedBlock.values.props !== undefined) {
          propsCases.push(
            sql`WHEN ${Block.id} = ${blockId} THEN ${updatedBlock.values.props as JSONType}`
          );
        }
        if (updatedBlock.values.content !== undefined) {
          contentCases.push(
            sql`WHEN ${Block.id} = ${blockId} THEN ${updatedBlock.values.content as JSONType[]}`
          );
        }

        const sourceBlockGroupId = currentBlockGroupByBlockId.get(blockId);
        const destinationBlockGroupId = updatedBlock.values.blockGroupId;
        if (
          sourceBlockGroupId &&
          destinationBlockGroupId &&
          sourceBlockGroupId !== destinationBlockGroupId
        ) {
          movedBlockGroupDeltas.set(
            sourceBlockGroupId,
            (movedBlockGroupDeltas.get(sourceBlockGroupId) ?? 0) - 1
          );
          movedBlockGroupDeltas.set(
            destinationBlockGroupId,
            (movedBlockGroupDeltas.get(destinationBlockGroupId) ?? 0) + 1
          );
        }
      }

      const setValues: Partial<{
        parentBlockId: SQL;
        blockGroupId: SQL;
        type: SQL;
        props: SQL;
        content: SQL;
        updatedAt: Date;
      }> = {
        updatedAt: response.data.updatedAt,
      };
      if (parentBlockCases.length > 0) {
        setValues.parentBlockId = sql`CASE ${sql.join(parentBlockCases, sql` `)} ELSE ${Block.parentBlockId} END`;
      }
      if (blockGroupCases.length > 0) {
        setValues.blockGroupId = sql`CASE ${sql.join(blockGroupCases, sql` `)} ELSE ${Block.blockGroupId} END`;
      }
      if (typeCases.length > 0) {
        setValues.type = sql`CASE ${sql.join(typeCases, sql` `)} ELSE ${Block.type} END`;
      }
      if (propsCases.length > 0) {
        setValues.props = sql`CASE ${sql.join(propsCases, sql` `)} ELSE ${Block.props} END`;
      }
      if (contentCases.length > 0) {
        setValues.content = sql`CASE ${sql.join(contentCases, sql` `)} ELSE ${Block.content} END`;
      }

      await tx
        .update(Block)
        .set(setValues)
        .where(
          and(
            inArray(Block.id, blockIds),
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

      await BlockLocalSynchronizer.applyBlockGroupSizeDeltas(
        tx,
        movedBlockGroupDeltas,
        response.data.updatedAt
      );

      const movedBlockGroupIds = Array.from(movedBlockGroupDeltas.keys());
      if (movedBlockGroupIds.length > 0) {
        const movedBlockGroups = await tx
          .select({
            id: BlockGroup.id,
            blockPackId: BlockGroup.blockPackId,
          })
          .from(BlockGroup)
          .where(inArray(BlockGroup.id, movedBlockGroupIds));
        const blockPackByBlockGroupId = new Map(
          movedBlockGroups.map(item => [item.id, item.blockPackId])
        );

        const movedBlockPackDeltas = new Map<string, number>();
        for (const [blockGroupId, delta] of movedBlockGroupDeltas.entries()) {
          const blockPackId = blockPackByBlockGroupId.get(blockGroupId);
          if (!blockPackId) continue;
          movedBlockPackDeltas.set(
            blockPackId,
            (movedBlockPackDeltas.get(blockPackId) ?? 0) + delta
          );
        }

        await BlockLocalSynchronizer.applyBlockPackCountDeltas(
          tx,
          movedBlockPackDeltas,
          response.data.updatedAt
        );
      }
    });
  };

  static syncRestoreMyBlockById = async (
    request: RestoreMyBlockByIdRequest,
    response: RestoreMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(Block)
        .values({
          id: response.data.id,
          parentBlockId: response.data.parentBlockId,
          blockGroupId: response.data.blockGroupId,
          type: response.data.type,
          props: response.data.props as any,
          content: response.data.content as any,
          deletedAt: null,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: Block.id,
          set: {
            parentBlockId: response.data.parentBlockId,
            blockGroupId: response.data.blockGroupId,
            type: response.data.type,
            props: response.data.props as any,
            content: response.data.content as any,
            deletedAt: null,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await tx
        .update(BlockGroup)
        .set({
          size: sql`${BlockGroup.size} + 1`,
          updatedAt: response.data.updatedAt,
        })
        .where(eq(BlockGroup.id, response.data.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + 1`,
          updatedAt: response.data.updatedAt,
        })
        .where(eq(BlockPack.id, request.affected.blockPackId));
    });
  };

  static syncRestoreMyBlocksByIds = async (
    request: RestoreMyBlocksByIdsRequest,
    response: RestoreMyBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(Block)
        .values(
          response.data.map(block => ({
            id: block.id,
            parentBlockId: block.parentBlockId,
            blockGroupId: block.blockGroupId,
            type: block.type,
            props: block.props as any,
            content: block.content as any,
            deletedAt: null,
            updatedAt: block.updatedAt,
            createdAt: block.createdAt,
          }))
        )
        .onConflictDoUpdate({
          target: Block.id,
          set: {
            parentBlockId: sql`excluded.parent_block_id`,
            blockGroupId: sql`excluded.block_group_id`,
            type: sql`excluded.type`,
            props: sql`excluded.props`,
            content: sql`excluded.content`,
            deletedAt: null,
            updatedAt: sql`excluded.updated_at`,
            createdAt: sql`excluded.created_at`,
          },
        });

      const blockGroupIdToDeltaMap = new Map<string, number>();
      for (const blockGroupId of request.affected.blockGroupIds) {
        blockGroupIdToDeltaMap.set(
          blockGroupId,
          (blockGroupIdToDeltaMap.get(blockGroupId) ?? 0) + 1
        );
      }

      const blockPackIdToDeltaMap = new Map<string, number>();
      for (const blockPackId of request.affected.blockPackIds) {
        blockPackIdToDeltaMap.set(
          blockPackId,
          (blockPackIdToDeltaMap.get(blockPackId) ?? 0) + 1
        );
      }

      const updatedAt =
        response.data[0]?.updatedAt ?? response.data[0]?.createdAt ?? new Date();
      await BlockLocalSynchronizer.applyBlockGroupSizeDeltas(
        tx,
        blockGroupIdToDeltaMap,
        updatedAt
      );
      await BlockLocalSynchronizer.applyBlockPackCountDeltas(
        tx,
        blockPackIdToDeltaMap,
        updatedAt
      );
    });
  };

  static syncDeleteMyBlockById = async (
    request: DeleteMyBlockByIdRequest,
    response: DeleteMyBlockByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .update(Block)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin],
              request.affected.blockGroupId
            )
          )
        );

      await tx
        .update(BlockGroup)
        .set({
          size: sql`max(0, ${BlockGroup.size} - 1)`,
          updatedAt: response.data.deletedAt,
        })
        .where(eq(BlockGroup.id, request.affected.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`,
          updatedAt: response.data.deletedAt,
        })
        .where(eq(BlockPack.id, request.affected.blockPackId));
    });
  };

  static syncDeleteMyBlocksByIds = async (
    request: DeleteMyBlocksByIdsRequest,
    response: DeleteMyBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .update(Block)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
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

      const blockGroupIdToDeltaMap = new Map<string, number>();
      for (const blockGroupId of request.affected.blockGroupIds) {
        blockGroupIdToDeltaMap.set(
          blockGroupId,
          (blockGroupIdToDeltaMap.get(blockGroupId) ?? 0) + 1
        );
      }
      for (const [id, count] of blockGroupIdToDeltaMap.entries()) {
        blockGroupIdToDeltaMap.set(id, -count);
      }
      await BlockLocalSynchronizer.applyBlockGroupSizeDeltas(
        tx,
        blockGroupIdToDeltaMap,
        response.data.deletedAt
      );

      const blockPackIdToDeltaMap = new Map<string, number>();
      for (const blockPackId of request.affected.blockPackIds) {
        blockPackIdToDeltaMap.set(
          blockPackId,
          (blockPackIdToDeltaMap.get(blockPackId) ?? 0) + 1
        );
      }
      for (const [id, count] of blockPackIdToDeltaMap.entries()) {
        blockPackIdToDeltaMap.set(id, -count);
      }
      await BlockLocalSynchronizer.applyBlockPackCountDeltas(
        tx,
        blockPackIdToDeltaMap,
        response.data.deletedAt
      );
    });
  };
}
