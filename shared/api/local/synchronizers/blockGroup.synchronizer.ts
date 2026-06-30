import {
  InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse,
  InsertBlockGroupsByBlockPackIdsRequest,
  InsertBlockGroupsByBlockPackIdsResponse,
  MoveMyBlockGroupsByBlockPackIdsRequest,
  MoveMyBlockGroupsByBlockPackIdsResponse,
  DeleteMyBlockGroupByIdRequest,
  DeleteMyBlockGroupByIdResponse,
  DeleteMyBlockGroupsByIdsRequest,
  DeleteMyBlockGroupsByIdsResponse,
  GetAllMyBlockGroupsByBlockPackIdResponse,
  GetMyBlockGroupAndItsBlocksByIdRequest,
  GetMyBlockGroupAndItsBlocksByIdResponse,
  GetMyBlockGroupByIdResponse,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  GetMyBlockGroupsAndTheirBlocksByIdsRequest,
  GetMyBlockGroupsAndTheirBlocksByIdsResponse,
  GetMyBlockGroupsByPrevBlockGroupIdResponse,
  InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
  InsertBlockGroupAndItsBlocksByBlockPackIdResponse,
  InsertBlockGroupByBlockPackIdRequest,
  InsertBlockGroupByBlockPackIdResponse,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  InsertBlockGroupsByBlockPackIdRequest,
  InsertBlockGroupsByBlockPackIdResponse,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
  InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse,
  MoveMyBlockGroupByIdRequest,
  MoveMyBlockGroupByIdResponse,
  MoveMyBlockGroupsByBlockPackIdRequest,
  MoveMyBlockGroupsByBlockPackIdResponse,
  RestoreMyBlockGroupByIdRequest,
  RestoreMyBlockGroupByIdResponse,
  RestoreMyBlockGroupsByIdsRequest,
  RestoreMyBlockGroupsByIdsResponse,
} from "@shared/api/interfaces/blockGroup.interface";
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
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockGroupLocalSynchronizer {
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
            blockPackId
              ? eq(BlockPack.id, blockPackId)
              : eq(BlockPack.id, BlockGroup.blockPackId)
          )
        )
    );

  private static upsertBlocks = async (
    tx: any,
    blockGroupId: string,
    arborizedEditableBlock:
      | InsertBlockGroupAndItsBlocksByBlockPackIdRequest["body"]["arborizedEditableBlock"]
      | null,
    createdAt: Date,
    updatedAt: Date
  ): Promise<number> => {
    const flattenedBlocks = EditableBlockManipulator.flatten(
      arborizedEditableBlock
    );
    const blocks = flattenedBlocks.map(flattenedBlock => ({
      id: flattenedBlock.id,
      parentBlockId: flattenedBlock.parentBlockId,
      blockGroupId,
      type: flattenedBlock.type,
      props: flattenedBlock.props,
      content: flattenedBlock.content,
      createdAt,
      updatedAt,
    }));

    await tx.delete(Block).where(eq(Block.blockGroupId, blockGroupId));

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
        size: blocks.length,
        updatedAt,
      })
      .where(eq(BlockGroup.id, blockGroupId));

    return blocks.length;
  };

  static syncGetMyBlockGroupById = async (
    response: GetMyBlockGroupByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(BlockGroup)
      .values({
        id: response.data.id,
        ownerPublicId: response.embedded.publicId,
        blockPackId: response.data.blockPackId,
        prevBlockGroupId: response.data.prevBlockGroupId,
        syncBlockGroupId: response.data.syncBlockGroupId,
        size: Number(response.data.size),
        deletedAt: response.data.deletedAt,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoUpdate({
        target: BlockGroup.id,
        set: {
          ownerPublicId: response.embedded.publicId,
          blockPackId: response.data.blockPackId,
          prevBlockGroupId: response.data.prevBlockGroupId,
          syncBlockGroupId: response.data.syncBlockGroupId,
          size: Number(response.data.size),
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        },
      });
  };

  static syncGetMyBlockGroupAndItsBlocksById = async (
    request: GetMyBlockGroupAndItsBlocksByIdRequest,
    response: GetMyBlockGroupAndItsBlocksByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(BlockGroup)
        .values({
          id: response.data.id,
          ownerPublicId: response.embedded.publicId,
          blockPackId: response.data.blockPackId,
          prevBlockGroupId: response.data.prevBlockGroupId,
          syncBlockGroupId: response.data.syncBlockGroupId,
          size: Number(response.data.size),
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: BlockGroup.id,
          set: {
            ownerPublicId: response.embedded.publicId,
            blockPackId: response.data.blockPackId,
            prevBlockGroupId: response.data.prevBlockGroupId,
            syncBlockGroupId: response.data.syncBlockGroupId,
            size: Number(response.data.size),
            deletedAt: response.data.deletedAt,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await BlockGroupLocalSynchronizer.upsertBlocks(
        tx,
        request.param.blockGroupId,
        response.data.rawArborizedEditableBlock,
        response.data.createdAt,
        response.data.updatedAt
      );
    });
  };

  static syncGetMyBlockGroupsAndTheirBlocksByIds = async (
    request: GetMyBlockGroupsAndTheirBlocksByIdsRequest,
    response: GetMyBlockGroupsAndTheirBlocksByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const blockGroup of response.data) {
        await tx
          .insert(BlockGroup)
          .values({
            id: blockGroup.id,
            ownerPublicId: response.embedded.publicId,
            blockPackId: blockGroup.blockPackId,
            prevBlockGroupId: blockGroup.prevBlockGroupId,
            syncBlockGroupId: blockGroup.syncBlockGroupId,
            size: Number(blockGroup.size),
            deletedAt: blockGroup.deletedAt,
            updatedAt: blockGroup.updatedAt,
            createdAt: blockGroup.createdAt,
          })
          .onConflictDoUpdate({
            target: BlockGroup.id,
            set: {
              ownerPublicId: response.embedded.publicId,
              blockPackId: blockGroup.blockPackId,
              prevBlockGroupId: blockGroup.prevBlockGroupId,
              syncBlockGroupId: blockGroup.syncBlockGroupId,
              size: Number(blockGroup.size),
              deletedAt: blockGroup.deletedAt,
              updatedAt: blockGroup.updatedAt,
              createdAt: blockGroup.createdAt,
            },
          });

        await BlockGroupLocalSynchronizer.upsertBlocks(
          tx,
          blockGroup.id,
          blockGroup.rawArborizedEditableBlock,
          blockGroup.createdAt,
          blockGroup.updatedAt
        );
      }

      const requestedIds = request.param.blockGroupIds;
      if (requestedIds.length > 0) {
        const receivedIdSet = new Set(
          response.data.map(blockGroup => blockGroup.id)
        );
        const missingIds = requestedIds.filter(id => !receivedIdSet.has(id));
        if (missingIds.length > 0) {
          await tx.delete(Block).where(inArray(Block.blockGroupId, missingIds));
        }
      }
    });
  };

  static syncGetMyBlockGroupsAndTheirBlocksByBlockPackId = async (
    request: GetMyBlockGroupsAndTheirBlocksByBlockPackIdRequest,
    response: GetMyBlockGroupsAndTheirBlocksByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const touchedGroupIds: string[] = [];

      for (const blockGroup of response.data) {
        touchedGroupIds.push(blockGroup.id);

        await tx
          .insert(BlockGroup)
          .values({
            id: blockGroup.id,
            ownerPublicId: response.embedded.publicId,
            blockPackId: blockGroup.blockPackId,
            prevBlockGroupId: blockGroup.prevBlockGroupId,
            syncBlockGroupId: blockGroup.syncBlockGroupId,
            size: Number(blockGroup.size),
            deletedAt: blockGroup.deletedAt,
            updatedAt: blockGroup.updatedAt,
            createdAt: blockGroup.createdAt,
          })
          .onConflictDoUpdate({
            target: BlockGroup.id,
            set: {
              ownerPublicId: response.embedded.publicId,
              blockPackId: blockGroup.blockPackId,
              prevBlockGroupId: blockGroup.prevBlockGroupId,
              syncBlockGroupId: blockGroup.syncBlockGroupId,
              size: Number(blockGroup.size),
              deletedAt: blockGroup.deletedAt,
              updatedAt: blockGroup.updatedAt,
              createdAt: blockGroup.createdAt,
            },
          });

        await BlockGroupLocalSynchronizer.upsertBlocks(
          tx,
          blockGroup.id,
          blockGroup.rawArborizedEditableBlock,
          blockGroup.createdAt,
          blockGroup.updatedAt
        );
      }

      const existingIds = await tx
        .select({ id: BlockGroup.id })
        .from(BlockGroup)
        .where(eq(BlockGroup.blockPackId, request.param.blockPackId));

      const staleIds = existingIds
        .map(row => row.id)
        .filter(id => !touchedGroupIds.includes(id));

      if (staleIds.length > 0) {
        await tx.delete(Block).where(inArray(Block.blockGroupId, staleIds));
      }
    });
  };

  static syncGetMyBlockGroupsByPrevBlockGroupId = async (
    response: GetMyBlockGroupsByPrevBlockGroupIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const blockGroups = response.data.map(blockGroup => ({
      id: blockGroup.id,
      ownerPublicId: response.embedded.publicId,
      blockPackId: blockGroup.blockPackId,
      prevBlockGroupId: blockGroup.prevBlockGroupId,
      syncBlockGroupId: blockGroup.syncBlockGroupId,
      size: Number(blockGroup.size),
      deletedAt: blockGroup.deletedAt,
      updatedAt: blockGroup.updatedAt,
      createdAt: blockGroup.createdAt,
    }));
    if (blockGroups.length === 0) return;

    await localDB
      .insert(BlockGroup)
      .values(blockGroups)
      .onConflictDoUpdate({
        target: BlockGroup.id,
        set: {
          ownerPublicId: sql`excluded.owner_public_id`,
          blockPackId: sql`excluded.block_pack_id`,
          prevBlockGroupId: sql`excluded.prev_block_group_id`,
          syncBlockGroupId: sql`excluded.sync_block_group_id`,
          size: sql`excluded.size`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncGetAllMyBlockGroupsByBlockPackId = async (
    response: GetAllMyBlockGroupsByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const blockGroups = response.data.map(blockGroup => ({
      id: blockGroup.id,
      ownerPublicId: response.embedded.publicId,
      blockPackId: blockGroup.blockPackId,
      prevBlockGroupId: blockGroup.prevBlockGroupId,
      syncBlockGroupId: blockGroup.syncBlockGroupId,
      size: Number(blockGroup.size),
      deletedAt: blockGroup.deletedAt,
      updatedAt: blockGroup.updatedAt,
      createdAt: blockGroup.createdAt,
    }));
    if (blockGroups.length === 0) return;

    await localDB
      .insert(BlockGroup)
      .values(blockGroups)
      .onConflictDoUpdate({
        target: BlockGroup.id,
        set: {
          ownerPublicId: sql`excluded.owner_public_id`,
          blockPackId: sql`excluded.block_pack_id`,
          prevBlockGroupId: sql`excluded.prev_block_group_id`,
          syncBlockGroupId: sql`excluded.sync_block_group_id`,
          size: sql`excluded.size`,
          deletedAt: sql`excluded.deleted_at`,
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };

  static syncInsertBlockGroupByBlockPackId = async (
    request: InsertBlockGroupByBlockPackIdRequest,
    response: InsertBlockGroupByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .insert(BlockGroup)
      .values({
        id: response.data.id,
        ownerPublicId: response.embedded.publicId,
        blockPackId: request.body.blockPackId,
        prevBlockGroupId: request.body.prevBlockGroupId,
        syncBlockGroupId: null,
        size: 0,
        deletedAt: null,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoNothing();
  };

  static syncInsertBlockGroupsByBlockPackId = async (
    request: InsertBlockGroupsByBlockPackIdRequest,
    response: InsertBlockGroupsByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const blockGroups = request.body.blockPackContents.map((content, index) => ({
      id: response.data.ids[index],
      ownerPublicId: response.embedded.publicId,
      blockPackId: request.body.blockPackId,
      prevBlockGroupId: content.prevBlockGroupId,
      syncBlockGroupId: null,
      size: 0,
      deletedAt: null,
      updatedAt: response.data.createdAt,
      createdAt: response.data.createdAt,
    }));
    if (blockGroups.length === 0) return;

    await localDB.insert(BlockGroup).values(blockGroups);
  };

  static syncInsertBlockGroupsByBlockPackIds = async (
    request: InsertBlockGroupsByBlockPackIdsRequest,
    response: InsertBlockGroupsByBlockPackIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();
    const blockGroups = request.body.blockPackContents.map((content, index) => ({
      id: response.data.ids[index],
      ownerPublicId: response.embedded.publicId,
      blockPackId: content.blockPackId,
      prevBlockGroupId: content.prevBlockGroupId,
      syncBlockGroupId: null,
      size: 0,
      deletedAt: null,
      updatedAt: response.data.createdAt,
      createdAt: response.data.createdAt,
    }));
    if (blockGroups.length === 0) return;

    await localDB.insert(BlockGroup).values(blockGroups);
  };

  static syncInsertBlockGroupAndItsBlocksByBlockPackId = async (
    request: InsertBlockGroupAndItsBlocksByBlockPackIdRequest,
    response: InsertBlockGroupAndItsBlocksByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const blockGroupId = response.data.id;

    await localDB.transaction(async tx => {
      await tx
        .insert(BlockGroup)
        .values({
          id: blockGroupId,
          ownerPublicId: response.embedded.publicId,
          blockPackId: request.body.blockPackId,
          prevBlockGroupId: request.body.prevBlockGroupId,
          syncBlockGroupId: null,
          size: 0,
          deletedAt: null,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: BlockGroup.id,
          set: {
            ownerPublicId: response.embedded.publicId,
            blockPackId: request.body.blockPackId,
            prevBlockGroupId: request.body.prevBlockGroupId,
            syncBlockGroupId: null,
            deletedAt: null,
            updatedAt: response.data.createdAt,
          },
        });

      const insertedBlockCount =
        await BlockGroupLocalSynchronizer.upsertBlocks(
          tx,
          blockGroupId,
          request.body.arborizedEditableBlock,
          response.data.createdAt,
          response.data.createdAt
        );

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${insertedBlockCount}`,
          updatedAt: response.data.createdAt,
        })
        .where(
          and(
            eq(BlockPack.id, request.body.blockPackId),
            BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ],
              request.body.blockPackId
            )
          )
        );
    });
  };

  static syncInsertBlockGroupsAndTheirBlocksByBlockPackId = async (
    request: InsertBlockGroupsAndTheirBlocksByBlockPackIdRequest,
    response: InsertBlockGroupsAndTheirBlocksByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      let insertedBlocks = 0;

      for (const successIndex of response.data.successIndexes) {
        const content = request.body.blockGroupContents[successIndex];
        const blockGroupId =
          response.data.successBlockGroupAndBlockIds[successIndex]
            ?.blockGroupId;
        if (!content || !blockGroupId) continue;

        await tx
          .insert(BlockGroup)
          .values({
            id: blockGroupId,
            ownerPublicId: response.embedded.publicId,
            blockPackId: request.body.blockPackId,
            prevBlockGroupId: content.prevBlockGroupId,
            syncBlockGroupId: null,
            size: 0,
            deletedAt: null,
            updatedAt: response.data.createdAt,
            createdAt: response.data.createdAt,
          })
          .onConflictDoUpdate({
            target: BlockGroup.id,
            set: {
              ownerPublicId: response.embedded.publicId,
              blockPackId: request.body.blockPackId,
              prevBlockGroupId: content.prevBlockGroupId,
              syncBlockGroupId: null,
              deletedAt: null,
              updatedAt: response.data.createdAt,
            },
          });

        insertedBlocks += await BlockGroupLocalSynchronizer.upsertBlocks(
          tx,
          blockGroupId,
          content.arborizedEditableBlock,
          response.data.createdAt,
          response.data.createdAt
        );
      }

      if (insertedBlocks > 0) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${insertedBlocks}`,
            updatedAt: response.data.createdAt,
          })
          .where(
            and(
              eq(BlockPack.id, request.body.blockPackId),
              BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                request.body.blockPackId
              )
            )
          );
      }
    });
  };

  static syncInsertBlockGroupsAndTheirBlocksByBlockPackIds = async (
    request: InsertBlockGroupsAndTheirBlocksByBlockPackIdsRequest,
    response: InsertBlockGroupsAndTheirBlocksByBlockPackIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const blockPackIdToCountMap = new Map<string, number>();

      for (const success of response.data.successBlockGroupAndBlockIds) {
        const requestContent = request.body.blockGroupContents.find(content => {
          if (content.blockPackId !== success.blockPackId) return false;
          if (content.blockGroupId)
            return content.blockGroupId === success.blockGroupId;
          return true;
        });
        if (!requestContent) continue;

        await tx
          .insert(BlockGroup)
          .values({
            id: success.blockGroupId,
            ownerPublicId: response.embedded.publicId,
            blockPackId: success.blockPackId,
            prevBlockGroupId: requestContent.prevBlockGroupId,
            syncBlockGroupId: null,
            size: 0,
            deletedAt: null,
            updatedAt: response.data.createdAt,
            createdAt: response.data.createdAt,
          })
          .onConflictDoUpdate({
            target: BlockGroup.id,
            set: {
              ownerPublicId: response.embedded.publicId,
              blockPackId: success.blockPackId,
              prevBlockGroupId: requestContent.prevBlockGroupId,
              syncBlockGroupId: null,
              deletedAt: null,
              updatedAt: response.data.createdAt,
            },
          });

        const insertedCount = await BlockGroupLocalSynchronizer.upsertBlocks(
          tx,
          success.blockGroupId,
          requestContent.arborizedEditableBlock,
          response.data.createdAt,
          response.data.createdAt
        );

        blockPackIdToCountMap.set(
          success.blockPackId,
          (blockPackIdToCountMap.get(success.blockPackId) ?? 0) + insertedCount
        );
      }

      for (const [
        blockPackId,
        insertedCount,
      ] of blockPackIdToCountMap.entries()) {
        if (insertedCount <= 0) continue;
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${insertedCount}`,
            updatedAt: response.data.createdAt,
          })
          .where(
            and(
              eq(BlockPack.id, blockPackId),
              BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                blockPackId
              )
            )
          );
      }
    });
  };

  static syncInsertSequentialBlockGroupsAndTheirBlocksByBlockPackId = async (
    request: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdRequest,
    response: InsertSequentialBlockGroupsAndTheirBlocksByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      let prevBlockGroupId = request.body.prevBlockGroupId;
      let insertedBlocks = 0;

      for (const successIndex of response.data.successIndexes) {
        const arborizedEditableBlock =
          request.body.arborizedEditableBlocks[successIndex];
        const success =
          response.data.successBlockGroupAndBlockIds[successIndex];
        if (!arborizedEditableBlock || !success) continue;

        await tx
          .insert(BlockGroup)
          .values({
            id: success.blockGroupId,
            ownerPublicId: response.embedded.publicId,
            blockPackId: request.body.blockPackId,
            prevBlockGroupId,
            syncBlockGroupId: null,
            size: 0,
            deletedAt: null,
            updatedAt: response.data.createdAt,
            createdAt: response.data.createdAt,
          })
          .onConflictDoUpdate({
            target: BlockGroup.id,
            set: {
              ownerPublicId: response.embedded.publicId,
              blockPackId: request.body.blockPackId,
              prevBlockGroupId,
              syncBlockGroupId: null,
              deletedAt: null,
              updatedAt: response.data.createdAt,
            },
          });

        insertedBlocks += await BlockGroupLocalSynchronizer.upsertBlocks(
          tx,
          success.blockGroupId,
          arborizedEditableBlock,
          response.data.createdAt,
          response.data.createdAt
        );

        prevBlockGroupId = success.blockGroupId;
      }

      if (insertedBlocks > 0) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${insertedBlocks}`,
            updatedAt: response.data.createdAt,
          })
          .where(
            and(
              eq(BlockPack.id, request.body.blockPackId),
              BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                request.body.blockPackId
              )
            )
          );
      }
    });
  };

  static syncMoveMyBlockGroupById = async (
    request: MoveMyBlockGroupByIdRequest,
    response: MoveMyBlockGroupByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(BlockGroup)
      .set({
        prevBlockGroupId: request.body.destinationBlockGroupId,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          eq(BlockGroup.id, request.body.movableBlockGroupId),
          eq(BlockGroup.blockPackId, request.body.blockPackId),
          BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ],
            request.body.blockPackId
          )
        )
      );
  };

  static syncMoveMyBlockGroupsByBlockPackId = async (
    request: MoveMyBlockGroupsByBlockPackIdRequest,
    response: MoveMyBlockGroupsByBlockPackIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB
      .update(BlockGroup)
      .set({
        prevBlockGroupId: request.body.destinationBlockGroupId,
        updatedAt: response.data.updatedAt,
      })
      .where(
        and(
          inArray(BlockGroup.id, request.body.movableBlockGroupIds),
          eq(BlockGroup.blockPackId, request.body.blockPackId),
          BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
            localDB,
            response.embedded.publicId,
            [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ],
            request.body.blockPackId
          )
        )
      );
  };

  static syncMoveMyBlockGroupsByBlockPackIds = async (
    request: MoveMyBlockGroupsByBlockPackIdsRequest,
    response: MoveMyBlockGroupsByBlockPackIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      for (const movedBlockGroup of request.body.movedBlockGroups) {
        await tx
          .update(BlockGroup)
          .set({
            prevBlockGroupId: movedBlockGroup.destinationBlockGroupId,
            updatedAt: response.data.updatedAt,
          })
          .where(
            and(
              eq(BlockGroup.id, movedBlockGroup.movableBlockGroupId),
              eq(BlockGroup.blockPackId, movedBlockGroup.blockPackId),
              BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
                tx,
                response.embedded.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ],
                movedBlockGroup.blockPackId
              )
            )
          );
      }
    });
  };

  static syncRestoreMyBlockGroupById = async (
    request: RestoreMyBlockGroupByIdRequest,
    response: RestoreMyBlockGroupByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      await tx
        .insert(BlockGroup)
        .values({
          id: response.data.id,
          ownerPublicId: response.embedded.publicId,
          blockPackId: response.data.blockPackId,
          prevBlockGroupId: response.data.prevBlockGroupId,
          syncBlockGroupId: response.data.syncBlockGroupId,
          size: Number(response.data.size),
          deletedAt: null,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoUpdate({
          target: BlockGroup.id,
          set: {
            ownerPublicId: response.embedded.publicId,
            blockPackId: response.data.blockPackId,
            prevBlockGroupId: response.data.prevBlockGroupId,
            syncBlockGroupId: response.data.syncBlockGroupId,
            size: Number(response.data.size),
            deletedAt: null,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.createdAt,
          },
        });

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${Number(response.data.size)}`,
          updatedAt: response.data.updatedAt,
        })
        .where(eq(BlockPack.id, response.data.blockPackId));
    });
  };

  static syncRestoreMyBlockGroupsByIds = async (
    request: RestoreMyBlockGroupsByIdsRequest,
    response: RestoreMyBlockGroupsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const restoredBlockGroups = response.data.map(blockGroup => ({
        id: blockGroup.id,
        ownerPublicId: response.embedded.publicId,
        blockPackId: blockGroup.blockPackId,
        prevBlockGroupId: blockGroup.prevBlockGroupId,
        syncBlockGroupId: blockGroup.syncBlockGroupId,
        size: Number(blockGroup.size),
        deletedAt: null,
        updatedAt: blockGroup.updatedAt,
        createdAt: blockGroup.createdAt,
      }));
      if (restoredBlockGroups.length > 0) {
        await tx
          .insert(BlockGroup)
          .values(restoredBlockGroups)
          .onConflictDoUpdate({
            target: BlockGroup.id,
            set: {
              ownerPublicId: sql`excluded.owner_public_id`,
              blockPackId: sql`excluded.block_pack_id`,
              prevBlockGroupId: sql`excluded.prev_block_group_id`,
              syncBlockGroupId: sql`excluded.sync_block_group_id`,
              size: sql`excluded.size`,
              deletedAt: null,
              updatedAt: sql`excluded.updated_at`,
              createdAt: sql`excluded.created_at`,
            },
          });
      }

      const blockPackIdToCountMap = new Map<string, number>();
      for (const blockGroup of response.data) {
        blockPackIdToCountMap.set(
          blockGroup.blockPackId,
          (blockPackIdToCountMap.get(blockGroup.blockPackId) ?? 0) +
            Number(blockGroup.size)
        );
      }

      for (const [blockPackId, count] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`${BlockPack.blockCount} + ${count}`,
            updatedAt: response.data[0]?.updatedAt ?? new Date(),
          })
          .where(eq(BlockPack.id, blockPackId));
      }
    });
  };

  static syncDeleteMyBlockGroupById = async (
    request: DeleteMyBlockGroupByIdRequest,
    response: DeleteMyBlockGroupByIdResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const targetBlockGroup = await tx.query.BlockGroup.findFirst({
        where: eq(BlockGroup.id, request.body.blockGroupId),
        columns: {
          size: true,
        },
      });

      await tx
        .update(BlockGroup)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            eq(BlockGroup.id, request.body.blockGroupId),
            BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin],
              request.affected.blockPackId
            )
          )
        );

      await tx
        .update(Block)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(eq(Block.blockGroupId, request.body.blockGroupId));

      const size = targetBlockGroup?.size ?? 0;
      if (size > 0) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`max(0, ${BlockPack.blockCount} - ${size})`,
            updatedAt: response.data.deletedAt,
          })
          .where(eq(BlockPack.id, request.affected.blockPackId));
      }
    });
  };

  static syncDeleteMyBlockGroupsByIds = async (
    request: DeleteMyBlockGroupsByIdsRequest,
    response: DeleteMyBlockGroupsByIdsResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const targetBlockGroups = await tx.query.BlockGroup.findMany({
        where: inArray(BlockGroup.id, request.body.blockGroupIds),
        columns: {
          id: true,
          blockPackId: true,
          size: true,
        },
      });

      await tx
        .update(BlockGroup)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(
          and(
            inArray(BlockGroup.id, request.body.blockGroupIds),
            BlockGroupLocalSynchronizer.getPassPermissionCheckSQL(
              tx,
              response.embedded.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      await tx
        .update(Block)
        .set({
          deletedAt: response.data.deletedAt,
          updatedAt: response.data.deletedAt,
        })
        .where(inArray(Block.blockGroupId, request.body.blockGroupIds));

      const blockPackIdToCountMap = new Map<string, number>();
      for (const targetBlockGroup of targetBlockGroups) {
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
            updatedAt: response.data.deletedAt,
          })
          .where(eq(BlockPack.id, blockPackId));
      }
    });
  };
}
