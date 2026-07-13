import {
  GetAllMyBlocksResponse,
  GetMyBlockByIdResponse,
  GetMyBlocksByBlockPackIdResponse,
  GetMyBlocksByIdsResponse,
} from "@shared/api/interfaces/block.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockPack,
  SubShelf,
  UsersToShelves,
} from "@shared/api/local/schemas";
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
          updatedAt: sql`excluded.updated_at`,
          createdAt: sql`excluded.created_at`,
        },
      });
  };
}
