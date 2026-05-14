import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
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
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockGroup,
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
    blockGroupId?: string
  ) =>
    exists(
      queryBuilder
        .select({ one: sql`1` })
        .from(UsersToShelves)
        .innerJoin(SubShelf, eq(SubShelf.rootShelfId, UsersToShelves.rootShelfId))
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
        props: JSON.stringify(response.data.props ?? {}),
        content: JSON.stringify(response.data.content ?? []),
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
          props: JSON.stringify(response.data.props ?? {}),
          content: JSON.stringify(response.data.content ?? []),
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
          props: JSON.stringify(block.props ?? {}),
          content: JSON.stringify(block.content ?? []),
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

    const rows = EditableBlockManipulator.flattenToRows(
      response.data.rawArborizedEditableBlock,
      {
        blockGroupId: request.param.blockGroupId,
      }
    );

    await localDB.transaction(async tx => {
      await tx.delete(Block).where(eq(Block.blockGroupId, request.param.blockGroupId));

      if (rows.length > 0) {
        await tx.insert(Block).values(rows).onConflictDoUpdate({
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
          size: rows.length,
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

    await localDB.transaction(async tx => {
      for (const [index, item] of response.data.entries()) {
        const blockGroupId = request.param.blockGroupIds[index];
        if (!blockGroupId) continue;

        const rows = EditableBlockManipulator.flattenToRows(
          item.rawArborizedEditableBlock,
          {
            blockGroupId,
          }
        );

        await tx.delete(Block).where(eq(Block.blockGroupId, blockGroupId));

        if (rows.length > 0) {
          await tx.insert(Block).values(rows).onConflictDoUpdate({
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
            size: rows.length,
            updatedAt: new Date(),
          })
          .where(eq(BlockGroup.id, blockGroupId));
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
          props: JSON.stringify(block.props ?? {}),
          content: JSON.stringify(block.content ?? []),
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
          props: JSON.stringify(block.props ?? {}),
          content: JSON.stringify(block.content ?? []),
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

    const rows = EditableBlockManipulator.flattenToRows(
      request.body.arborizedEditableBlock,
      {
        blockGroupId: request.body.blockGroupId,
        createdAt: response.data.createdAt,
        updatedAt: response.data.createdAt,
      }
    );

    await localDB.transaction(async tx => {
      if (rows.length > 0) {
        await tx.insert(Block).values(rows).onConflictDoUpdate({
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
          size: sql`${BlockGroup.size} + ${rows.length}`,
          updatedAt: response.data.createdAt,
        })
        .where(eq(BlockGroup.id, request.body.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${rows.length}`,
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
      const insertedRows: Array<{
        id: string;
        parentBlockId: string | null;
        blockGroupId: string;
        type: string;
        props: string;
        content: string;
        updatedAt?: Date;
        createdAt?: Date;
      }> = [];

      for (const successIndex of response.data.successIndexes) {
        const insertedBlock = request.body.insertedBlocks[successIndex];
        if (!insertedBlock) continue;

        const rows = EditableBlockManipulator.flattenToRows(
          insertedBlock.arborizedEditableBlock,
          {
            blockGroupId: insertedBlock.blockGroupId,
            createdAt: response.data.createdAt,
            updatedAt: response.data.createdAt,
          }
        );

        insertedRows.push(...rows);

        blockGroupIdToCountMap.set(
          insertedBlock.blockGroupId,
          (blockGroupIdToCountMap.get(insertedBlock.blockGroupId) ?? 0) +
            rows.length
        );

        const blockPackId = request.affected.blockPackIds[successIndex];
        if (blockPackId) {
          blockPackIdToCountMap.set(
            blockPackId,
            (blockPackIdToCountMap.get(blockPackId) ?? 0) + rows.length
          );
        }
      }

      if (insertedRows.length > 0) {
        await tx.insert(Block).values(insertedRows).onConflictDoUpdate({
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

      for (const [blockGroupId, count] of blockGroupIdToCountMap.entries()) {
        await tx
          .update(BlockGroup)
          .set({
            size: sql`${BlockGroup.size} + ${count}`,
            updatedAt: response.data.createdAt,
          })
          .where(eq(BlockGroup.id, blockGroupId));
      }

      for (const [blockPackId, count] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${count}`,
            updatedAt: response.data.createdAt,
          })
          .where(eq(BlockPack.id, blockPackId));
      }
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
      props: string;
      content: string;
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
      setValues.props = JSON.stringify(request.body.values.props ?? {});
    }
    if (request.body.values.content !== undefined) {
      setValues.content = JSON.stringify(request.body.values.content ?? []);
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

    await localDB.transaction(async tx => {
      for (const updatedBlock of request.body.updatedBlocks) {
        const existing = await tx.query.Block.findFirst({
          where: eq(Block.id, updatedBlock.blockId),
          columns: {
            blockGroupId: true,
          },
        });

        const setValues: Partial<{
          parentBlockId: string | null;
          blockGroupId: string;
          type: string;
          props: string;
          content: string;
          updatedAt: Date;
        }> = {
          updatedAt: response.data.updatedAt,
        };

        if (updatedBlock.values.parentBlockId !== undefined) {
          setValues.parentBlockId = updatedBlock.values.parentBlockId;
        }
        if (updatedBlock.values.blockGroupId !== undefined) {
          setValues.blockGroupId = updatedBlock.values.blockGroupId;
        }
        if (updatedBlock.values.type !== undefined) {
          setValues.type = updatedBlock.values.type ?? "paragraph";
        }
        if (updatedBlock.values.props !== undefined) {
          setValues.props = JSON.stringify(updatedBlock.values.props ?? {});
        }
        if (updatedBlock.values.content !== undefined) {
          setValues.content = JSON.stringify(updatedBlock.values.content ?? []);
        }
        if (updatedBlock.setNull?.parentBlockId) {
          setValues.parentBlockId = null;
        }

        await tx
          .update(Block)
          .set(setValues)
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

        const sourceBlockGroupId = existing?.blockGroupId;
        const destinationBlockGroupId = updatedBlock.values.blockGroupId;
        if (
          sourceBlockGroupId &&
          destinationBlockGroupId &&
          sourceBlockGroupId !== destinationBlockGroupId
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
          props: JSON.stringify(response.data.props ?? {}),
          content: JSON.stringify(response.data.content ?? []),
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
            props: JSON.stringify(response.data.props ?? {}),
            content: JSON.stringify(response.data.content ?? []),
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
            props: JSON.stringify(block.props ?? {}),
            content: JSON.stringify(block.content ?? []),
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

      const blockGroupIdToCountMap = new Map<string, number>();
      for (const blockGroupId of request.affected.blockGroupIds) {
        blockGroupIdToCountMap.set(
          blockGroupId,
          (blockGroupIdToCountMap.get(blockGroupId) ?? 0) + 1
        );
      }

      const blockPackIdToCountMap = new Map<string, number>();
      for (const blockPackId of request.affected.blockPackIds) {
        blockPackIdToCountMap.set(
          blockPackId,
          (blockPackIdToCountMap.get(blockPackId) ?? 0) + 1
        );
      }

      for (const [blockGroupId, count] of blockGroupIdToCountMap.entries()) {
        await tx
          .update(BlockGroup)
          .set({
            size: sql`${BlockGroup.size} + ${count}`,
            updatedAt: new Date(),
          })
          .where(eq(BlockGroup.id, blockGroupId));
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

      const blockGroupIdToCountMap = new Map<string, number>();
      for (const blockGroupId of request.affected.blockGroupIds) {
        blockGroupIdToCountMap.set(
          blockGroupId,
          (blockGroupIdToCountMap.get(blockGroupId) ?? 0) + 1
        );
      }

      const blockPackIdToCountMap = new Map<string, number>();
      for (const blockPackId of request.affected.blockPackIds) {
        blockPackIdToCountMap.set(
          blockPackId,
          (blockPackIdToCountMap.get(blockPackId) ?? 0) + 1
        );
      }

      for (const [blockGroupId, count] of blockGroupIdToCountMap.entries()) {
        await tx
          .update(BlockGroup)
          .set({
            size: sql`max(0, ${BlockGroup.size} - ${count})`,
            updatedAt: response.data.deletedAt,
          })
          .where(eq(BlockGroup.id, blockGroupId));
      }

      for (const [blockPackId, count] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`max(0, ${BlockPack.blockCount} - ${count})`,
            updatedAt: response.data.deletedAt,
          })
          .where(eq(BlockPack.id, blockPackId));
      }
    });
  };
}
