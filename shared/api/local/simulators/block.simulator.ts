import {
  GetAllMyBlocksRequest,
  GetMyBlockByIdRequest,
  GetMyBlocksByBlockPackIdRequest,
  GetMyBlocksByIdsRequest,
} from "@shared/api/interfaces/block.interface";
import { AccessControlPermission } from "@shared/api/interfaces/enums/accessControlPermission.enum";
import { localDB } from "@shared/api/local/db";
import {
  Block,
  BlockPack,
  SubShelf,
  User,
  UsersToShelves,
} from "@shared/api/local/schemas";
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
}
