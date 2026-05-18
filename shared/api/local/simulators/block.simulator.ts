import { PartialBlock } from "@blocknote/core";
import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlocksByIdsRequest,
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
  InsertBlockRequest,
  InsertBlockResponse,
  InsertBlocksRequest,
  RestoreMyBlockByIdRequest,
  RestoreMyBlocksByIdsRequest,
  UpdateMyBlockByIdRequest,
  UpdateMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
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
import {
  and,
  eq,
  exists,
  InferSelectModel,
  inArray,
  SQL,
  sql,
} from "drizzle-orm";
import { JSONType } from "zod";

export class BlockLocalSimulator {
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

  static simulateGetMyBlockById = async (
    request: GetMyBlockByIdRequest
  ): Promise<InferSelectModel<typeof Block> | null> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return null;

    const rows = await localDB
      .select({
        id: Block.id,
        parentBlockId: Block.parentBlockId,
        blockGroupId: Block.blockGroupId,
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
          BlockLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ]
          )
        )
      )
      .limit(1);

    if (!rows[0]) return null;

    return {
      ...rows[0],
      props: rows[0].props as any,
      content: rows[0].content as any,
    };
  };

  static simulateGetMyBlocksByIds = async (
    request: GetMyBlocksByIdsRequest
  ): Promise<InferSelectModel<typeof Block>[]> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const rows = await localDB
      .select({
        id: Block.id,
        parentBlockId: Block.parentBlockId,
        blockGroupId: Block.blockGroupId,
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
          BlockLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ]
          )
        )
      );

    return rows.map(row => ({
      ...row,
      props: row.props as any,
      content: row.content as any,
    }));
  };

  static simulateGetMyBlocksByBlockGroupId = async (
    request: GetMyBlocksByBlockGroupIdRequest
  ): Promise<{
    rawArborizedEditableBlock: PartialBlock;
  }> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return { rawArborizedEditableBlock: {} };

    const hasPermission = await localDB
      .select({ one: sql`1` })
      .from(BlockGroup)
      .where(
        and(
          eq(BlockGroup.id, request.param.blockGroupId),
          BlockLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ],
            request.param.blockGroupId
          )
        )
      )
      .limit(1);

    if (hasPermission.length === 0) return { rawArborizedEditableBlock: {} };

    const blocks = await localDB.query.Block.findMany({
      where: eq(Block.blockGroupId, request.param.blockGroupId),
      columns: {
        id: true,
        parentBlockId: true,
        type: true,
        props: true,
        content: true,
      },
    });

    return {
      rawArborizedEditableBlock: EditableBlockManipulator.arborizeRows(
        blocks.map(block => ({
          id: block.id,
          parentBlockId: block.parentBlockId,
          type: block.type,
          props: block.props,
          content: block.content,
        }))
      ),
    };
  };

  static simulateGetMyBlocksByBlockGroupIds = async (
    request: GetMyBlocksByBlockGroupIdsRequest
  ): Promise<
    {
      rawArborizedEditableBlock: PartialBlock;
    }[]
  > => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const results: Array<{ rawArborizedEditableBlock: PartialBlock }> = [];

    for (const blockGroupId of request.param.blockGroupIds) {
      const hasPermission = await localDB
        .select({ one: sql`1` })
        .from(BlockGroup)
        .where(
          and(
            eq(BlockGroup.id, blockGroupId),
            BlockLocalSimulator.getPassPermissionCheckSQL(
              localDB,
              loggedInUser.publicId,
              [
                AccessControlPermission.Read,
                AccessControlPermission.Write,
                AccessControlPermission.Admin,
                AccessControlPermission.Owner,
              ],
              blockGroupId
            )
          )
        )
        .limit(1);

      if (hasPermission.length === 0) {
        results.push({ rawArborizedEditableBlock: {} });
        continue;
      }

      const blocks = await localDB.query.Block.findMany({
        where: eq(Block.blockGroupId, blockGroupId),
        columns: {
          id: true,
          parentBlockId: true,
          type: true,
          props: true,
          content: true,
        },
      });

      results.push({
        rawArborizedEditableBlock: EditableBlockManipulator.arborizeRows(
          blocks.map(block => ({
            id: block.id,
            parentBlockId: block.parentBlockId,
            type: block.type,
            props: block.props,
            content: block.content,
          }))
        ),
      });
    }

    return results;
  };

  static simulateGetMyBlocksByBlockPackId = async (
    request: GetMyBlocksByBlockPackIdRequest
  ): Promise<InferSelectModel<typeof Block>[]> => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const rows = await localDB
      .select({
        id: Block.id,
        parentBlockId: Block.parentBlockId,
        blockGroupId: Block.blockGroupId,
        type: Block.type,
        props: Block.props,
        content: Block.content,
        deletedAt: Block.deletedAt,
        updatedAt: Block.updatedAt,
        createdAt: Block.createdAt,
      })
      .from(Block)
      .innerJoin(BlockGroup, eq(BlockGroup.id, Block.blockGroupId))
      .where(
        and(
          eq(BlockGroup.blockPackId, request.param.blockPackId),
          BlockLocalSimulator.getPassPermissionCheckSQL(
            localDB,
            loggedInUser.publicId,
            [
              AccessControlPermission.Read,
              AccessControlPermission.Write,
              AccessControlPermission.Admin,
              AccessControlPermission.Owner,
            ]
          )
        )
      );

    return rows.map(row => ({
      ...row,
      props: row.props as any,
      content: row.content as any,
    }));
  };

  static simulateGetAllMyBlocks = async (): Promise<
    InferSelectModel<typeof Block>[]
  > => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const rows = await localDB
      .select({
        id: Block.id,
        parentBlockId: Block.parentBlockId,
        blockGroupId: Block.blockGroupId,
        type: Block.type,
        props: Block.props,
        content: Block.content,
        deletedAt: Block.deletedAt,
        updatedAt: Block.updatedAt,
        createdAt: Block.createdAt,
      })
      .from(Block)
      .where(
        BlockLocalSimulator.getPassPermissionCheckSQL(
          localDB,
          loggedInUser.publicId,
          [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ]
        )
      );

    return rows.map(row => ({
      ...row,
      props: row.props as any,
      content: row.content as any,
    }));
  };

  static simulateInsertBlock = async (
    request: InsertBlockRequest,
    response?: InsertBlockResponse
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const flattenedBlocks = EditableBlockManipulator.flatten(
        request.body.arborizedEditableBlock
      );
      const insertedBlocks = flattenedBlocks.map(flattenedBlock => ({
        id: flattenedBlock.id,
        parentBlockId: flattenedBlock.parentBlockId,
        blockGroupId: request.body.blockGroupId,
        type: flattenedBlock.type,
        props: flattenedBlock.props,
        content: flattenedBlock.content,
        createdAt: response?.data.createdAt ?? new Date(),
        updatedAt: response?.data.createdAt ?? new Date(),
      }));

      if (insertedBlocks.length > 0) {
        await tx.insert(Block).values(insertedBlocks);
      }

      await tx
        .update(BlockGroup)
        .set({
          size: sql`${BlockGroup.size} + ${insertedBlocks.length}`,
          updatedAt: new Date(),
        })
        .where(eq(BlockGroup.id, request.body.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${insertedBlocks.length}`,
          updatedAt: new Date(),
        })
        .where(eq(BlockPack.id, request.affected.blockPackId));

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

      const blockPackIdToCountMap = new Map<string, number>();
      const blockGroupIdToCountMap = new Map<string, number>();

      for (const [index, inserted] of request.body.insertedBlocks.entries()) {
        const flattenedBlocks = EditableBlockManipulator.flatten(
          inserted.arborizedEditableBlock
        );
        const insertedBlocks = flattenedBlocks.map(flattenedBlock => ({
          id: flattenedBlock.id,
          parentBlockId: flattenedBlock.parentBlockId,
          blockGroupId: inserted.blockGroupId,
          type: flattenedBlock.type,
          props: flattenedBlock.props,
          content: flattenedBlock.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        if (insertedBlocks.length > 0) {
          await tx.insert(Block).values(insertedBlocks);
        }

        blockGroupIdToCountMap.set(
          inserted.blockGroupId,
          (blockGroupIdToCountMap.get(inserted.blockGroupId) ?? 0) +
            insertedBlocks.length
        );

        const blockPackId = request.affected.blockPackIds[index];
        if (blockPackId) {
          blockPackIdToCountMap.set(
            blockPackId,
            (blockPackIdToCountMap.get(blockPackId) ?? 0) +
              insertedBlocks.length
          );
        }
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
        parentBlockId: string | null;
        blockGroupId: string;
        type: string;
        props: JSONType;
        content: JSONType[];
        updatedAt: Date;
      }> = {
        updatedAt: new Date(),
      };

      if (request.body.values.parentBlockId !== undefined)
        setValues.parentBlockId = request.body.values.parentBlockId;
      if (request.body.values.blockGroupId !== undefined)
        setValues.blockGroupId = request.body.values.blockGroupId;
      if (request.body.values.type !== undefined)
        setValues.type = request.body.values.type ?? "paragraph";
      if (request.body.values.props !== undefined)
        setValues.props = request.body.values.props as any;
      if (request.body.values.content !== undefined)
        setValues.content = request.body.values.content as any;
      if (request.body.setNull?.parentBlockId) setValues.parentBlockId = null;

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
            BlockLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
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
            updatedAt: new Date(),
          })
          .where(eq(BlockGroup.id, sourceBlockGroupId));
        await tx
          .update(BlockGroup)
          .set({
            size: sql`${BlockGroup.size} + 1`,
            updatedAt: new Date(),
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
              updatedAt: new Date(),
            })
            .where(eq(BlockPack.id, sourceBlockPackId));
          await tx
            .update(BlockPack)
            .set({
              blockCount: sql`${BlockPack.blockCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(BlockPack.id, destinationBlockPackId));
        }
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

  static simulateUpdateMyBlocksByIds = async (
    request: UpdateMyBlocksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      for (const updated of request.body.updatedBlocks) {
        const existing = await tx.query.Block.findFirst({
          where: eq(Block.id, updated.blockId),
          columns: {
            blockGroupId: true,
          },
        });

        const setValues: Partial<{
          parentBlockId: string | null;
          blockGroupId: string;
          type: string;
          props: JSONType;
          content: JSONType[];
          updatedAt: Date;
        }> = {
          updatedAt: new Date(),
        };

        if (updated.values.parentBlockId !== undefined)
          setValues.parentBlockId = updated.values.parentBlockId;
        if (updated.values.blockGroupId !== undefined)
          setValues.blockGroupId = updated.values.blockGroupId;
        if (updated.values.type !== undefined)
          setValues.type = updated.values.type ?? "paragraph";
        if (updated.values.props !== undefined)
          setValues.props = updated.values.props as any;
        if (updated.values.content !== undefined)
          setValues.content = updated.values.content as any;
        if (updated.setNull?.parentBlockId) setValues.parentBlockId = null;

        await tx
          .update(Block)
          .set(setValues)
          .where(
            and(
              eq(Block.id, updated.blockId),
              BlockLocalSimulator.getPassPermissionCheckSQL(
                tx,
                loggedInUser.publicId,
                [
                  AccessControlPermission.Owner,
                  AccessControlPermission.Admin,
                  AccessControlPermission.Write,
                ]
              )
            )
          );

        const sourceBlockGroupId = existing?.blockGroupId;
        const destinationBlockGroupId = updated.values.blockGroupId;
        if (
          sourceBlockGroupId &&
          destinationBlockGroupId &&
          sourceBlockGroupId !== destinationBlockGroupId
        ) {
          await tx
            .update(BlockGroup)
            .set({
              size: sql`max(0, ${BlockGroup.size} - 1)`,
              updatedAt: new Date(),
            })
            .where(eq(BlockGroup.id, sourceBlockGroupId));
          await tx
            .update(BlockGroup)
            .set({
              size: sql`${BlockGroup.size} + 1`,
              updatedAt: new Date(),
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
                updatedAt: new Date(),
              })
              .where(eq(BlockPack.id, sourceBlockPackId));
            await tx
              .update(BlockPack)
              .set({
                blockCount: sql`${BlockPack.blockCount} + 1`,
                updatedAt: new Date(),
              })
              .where(eq(BlockPack.id, destinationBlockPackId));
          }
        }
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

  static simulateRestoreMyBlockById = async (
    request: RestoreMyBlockByIdRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(Block)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
            )
          )
        );

      await tx
        .update(BlockGroup)
        .set({
          size: sql`${BlockGroup.size} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(BlockGroup.id, request.affected.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(BlockPack.id, request.affected.blockPackId));

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.RESTORE,
        body: request.body,
        affected: request.affected,
      });
    });
  };

  static simulateRestoreMyBlocksByIds = async (
    request: RestoreMyBlocksByIdsRequest
  ): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      await tx
        .update(Block)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(Block.id, request.body.blockIds),
            BlockLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ]
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

      await tx.insert(Transaction).values({
        ownerPublicId: loggedInUser.publicId,
        entityType: TransactionEntityType.Block,
        actionType: TransactionActionType.RESTORE,
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

      await tx
        .update(Block)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(Block.id, request.body.blockId),
            BlockLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
              [AccessControlPermission.Owner, AccessControlPermission.Admin]
            )
          )
        );

      await tx
        .update(BlockGroup)
        .set({
          size: sql`max(0, ${BlockGroup.size} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(BlockGroup.id, request.affected.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`max(0, ${BlockPack.blockCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(BlockPack.id, request.affected.blockPackId));

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
      if (!loggedInUser) return;

      await tx
        .update(Block)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            inArray(Block.id, request.body.blockIds),
            BlockLocalSimulator.getPassPermissionCheckSQL(
              tx,
              loggedInUser.publicId,
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
            updatedAt: new Date(),
          })
          .where(eq(BlockGroup.id, blockGroupId));
      }

      for (const [blockPackId, count] of blockPackIdToCountMap.entries()) {
        await tx
          .update(BlockPack)
          .set({
            blockCount: sql`max(0, ${BlockPack.blockCount} - ${count})`,
            updatedAt: new Date(),
          })
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
