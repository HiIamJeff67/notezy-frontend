import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import {
  DeleteMyBlockByIdRequest,
  DeleteMyBlocksByIdsRequest,
  GetAllMyBlocksRequest,
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockGroupIdRequest,
  GetMyBlocksByBlockGroupIdsRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
  InsertBlockRequest,
  InsertBlocksRequest,
  RestoreMyBlockByIdRequest,
  RestoreMyBlocksByIdsRequest,
  UpdateMyBlockByIdRequest,
  UpdateMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
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
import { and, eq, exists, inArray, sql } from "drizzle-orm";

export class BlockLocalSimulator {
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

  static simulateGetMyBlockById = async (request: GetMyBlockByIdRequest) => {
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
          BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ])
        )
      )
      .limit(1);

    if (!rows[0]) return null;

    return {
      ...rows[0],
      props: JSON.parse(rows[0].props || "{}"),
      content: JSON.parse(rows[0].content || "[]"),
    };
  };

  static simulateGetMyBlocksByIds = async (request: GetMyBlocksByIdsRequest) => {
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
          BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ])
        )
      );

    return rows.map(row => ({
      ...row,
      props: JSON.parse(row.props || "{}"),
      content: JSON.parse(row.content || "[]"),
    }));
  };

  static simulateGetMyBlocksByBlockGroupId = async (
    request: GetMyBlocksByBlockGroupIdRequest
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return { rawArborizedEditableBlock: null };

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

    if (hasPermission.length === 0) {
      return { rawArborizedEditableBlock: null };
    }

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
  ) => {
    if (!localDB.isReady) await localDB.ensureReady();

    const loggedInUser = await localDB.query.User.findFirst({
      where: eq(User.isLoggedIn, true),
    });
    if (!loggedInUser) return [];

    const results: Array<{ rawArborizedEditableBlock: unknown }> = [];

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
        results.push({ rawArborizedEditableBlock: null });
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
  ) => {
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
          BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
            AccessControlPermission.Read,
            AccessControlPermission.Write,
            AccessControlPermission.Admin,
            AccessControlPermission.Owner,
          ])
        )
      );

    return rows.map(row => ({
      ...row,
      props: JSON.parse(row.props || "{}"),
      content: JSON.parse(row.content || "[]"),
    }));
  };

  static simulateGetAllMyBlocks = async (_request: GetAllMyBlocksRequest) => {
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
        BlockLocalSimulator.getPassPermissionCheckSQL(localDB, loggedInUser.publicId, [
          AccessControlPermission.Read,
          AccessControlPermission.Write,
          AccessControlPermission.Admin,
          AccessControlPermission.Owner,
        ])
      );

    return rows.map(row => ({
      ...row,
      props: JSON.parse(row.props || "{}"),
      content: JSON.parse(row.content || "[]"),
    }));
  };

  static simulateInsertBlock = async (request: InsertBlockRequest): Promise<void> => {
    if (!localDB.isReady) await localDB.ensureReady();

    await localDB.transaction(async tx => {
      const loggedInUser = await tx.query.User.findFirst({
        where: eq(User.isLoggedIn, true),
      });
      if (!loggedInUser) return;

      const rows = EditableBlockManipulator.flattenToRows(
        request.body.arborizedEditableBlock,
        {
          blockGroupId: request.body.blockGroupId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      if (rows.length > 0) {
        await tx.insert(Block).values(rows);
      }

      await tx
        .update(BlockGroup)
        .set({
          size: sql`${BlockGroup.size} + ${rows.length}`,
          updatedAt: new Date(),
        })
        .where(eq(BlockGroup.id, request.body.blockGroupId));

      await tx
        .update(BlockPack)
        .set({
          blockCount: sql`${BlockPack.blockCount} + ${rows.length}`,
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
        const rows = EditableBlockManipulator.flattenToRows(
          inserted.arborizedEditableBlock,
          {
            blockGroupId: inserted.blockGroupId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        );

        if (rows.length > 0) {
          await tx.insert(Block).values(rows);
        }

        blockGroupIdToCountMap.set(
          inserted.blockGroupId,
          (blockGroupIdToCountMap.get(inserted.blockGroupId) ?? 0) + rows.length
        );

        const blockPackId = request.affected.blockPackIds[index];
        if (blockPackId) {
          blockPackIdToCountMap.set(
            blockPackId,
            (blockPackIdToCountMap.get(blockPackId) ?? 0) + rows.length
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
        props: string;
        content: string;
        updatedAt: Date;
      }> = {
        updatedAt: new Date(),
      };

      if (request.body.values.parentBlockId !== undefined) setValues.parentBlockId = request.body.values.parentBlockId;
      if (request.body.values.blockGroupId !== undefined) setValues.blockGroupId = request.body.values.blockGroupId;
      if (request.body.values.type !== undefined) setValues.type = request.body.values.type ?? "paragraph";
      if (request.body.values.props !== undefined) setValues.props = JSON.stringify(request.body.values.props ?? {});
      if (request.body.values.content !== undefined) setValues.content = JSON.stringify(request.body.values.content ?? []);
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
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
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
          props: string;
          content: string;
          updatedAt: Date;
        }> = {
          updatedAt: new Date(),
        };

        if (updated.values.parentBlockId !== undefined) setValues.parentBlockId = updated.values.parentBlockId;
        if (updated.values.blockGroupId !== undefined) setValues.blockGroupId = updated.values.blockGroupId;
        if (updated.values.type !== undefined) setValues.type = updated.values.type ?? "paragraph";
        if (updated.values.props !== undefined) setValues.props = JSON.stringify(updated.values.props ?? {});
        if (updated.values.content !== undefined) setValues.content = JSON.stringify(updated.values.content ?? []);
        if (updated.setNull?.parentBlockId) setValues.parentBlockId = null;

        await tx
          .update(Block)
          .set(setValues)
          .where(
            and(
              eq(Block.id, updated.blockId),
              BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
                AccessControlPermission.Owner,
                AccessControlPermission.Admin,
                AccessControlPermission.Write,
              ])
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
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
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
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
              AccessControlPermission.Write,
            ])
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
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
            ])
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
            BlockLocalSimulator.getPassPermissionCheckSQL(tx, loggedInUser.publicId, [
              AccessControlPermission.Owner,
              AccessControlPermission.Admin,
            ])
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
