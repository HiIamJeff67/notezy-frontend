import { UUID } from "crypto";

export const queryKeys = {
  user: {
    all: () => ["user"] as const,
    data: () => ["user", "data"] as const,
    me: () => ["user", "me"] as const,
  },
  userInfo: {
    all: () => ["userInfo"] as const,
    my: () => ["userInfo", "my"] as const,
  },
  rootShelf: {
    all: () => ["rootShelf"] as const,
    oneById: (rootShelfId: UUID | undefined) =>
      ["rootShelf", "oneById", rootShelfId?.toString()] as const,
  },
  subShelf: {
    all: () => ["subShelf"] as const,
    oneById: (subShelfId?: UUID) =>
      ["subShelf", "oneById", subShelfId?.toString()] as const,
    manyByPrevSubShelfId: (prevSubShelfId?: UUID | null) =>
      ["subShelf", "manyByPrevSubShelfId", prevSubShelfId?.toString()] as const,
    manyByRootShelfId: (rootShelfId?: UUID) =>
      ["subShelf", "manyByRootShelfId", rootShelfId?.toString()] as const,
  },
  material: {
    all: () => ["material"] as const,
    oneById: (id?: UUID) => ["material", "oneById", id] as const,
    manyByParentSubShelfId: (parentSubShelfId?: UUID) =>
      ["material", "manyByParentSubShelfId", parentSubShelfId] as const,
    manyByRootShelfId: (rootShelfId?: UUID) =>
      ["material", "manyByRootShelfId", rootShelfId] as const,
  },
  blockPack: {
    all: () => ["blockPack"] as const,
    oneById: (id?: UUID) => ["blockPack", "oneById", id] as const,
    manyByParentSubShelfId: (parentSubShelfId?: UUID) =>
      ["blockPack", "manyByParentSubShelfId", parentSubShelfId] as const,
    manyByRootShelfId: (rootShelfId?: UUID) =>
      ["blockPack", "manyByRootShelfId", rootShelfId] as const,
  },
  blockGroup: {
    all: () => ["blockGroup"] as const,
    oneById: (id?: UUID) => ["blockGroup", "oneById", id] as const,
    manyByBlockPackId: (blockPackId?: UUID) =>
      ["blockPack", "manyByBlockPackId", blockPackId] as const,
    manyByPrevBlockGroupId: (prevBlockGroupId?: UUID | null) =>
      ["blockGroup", "manyByPrevBlockGroupId", prevBlockGroupId] as const,
  },
  block: {},
  blockPackWithBlockGroup: {
    all: () => [] as const,
    oneById: (blockPackId?: UUID) =>
      ["blockPackWithBlockGroup", "oneById", blockPackId] as const,
  },
  blockPackWithBlockGroupAndBlock: {
    all: () => [] as const,
    oneById: (blockPackId?: UUID) => [
      "blockPackWithBlockGroupAndBlock",
      "oneById",
      blockPackId,
    ],
  },
  blockGroupWithBlock: {
    all: () => [] as const,
    oneById: (blockGroupId?: UUID) =>
      ["blockGroupWithBlock", "oneById", blockGroupId] as const,
    manyByIds: (blockGroupIds?: UUID[]) =>
      [
        "blockGroupWithBlock",
        "manyByIds",
        blockGroupIds && blockGroupIds.length > 0
          ? blockGroupIds.slice().sort().join(",")
          : undefined,
      ] as const,
    manyByBlockPackId: (blockPackId?: UUID) =>
      ["blockGroupWithBlock", "manyByBlockPackId", blockPackId] as const,
  },
};
