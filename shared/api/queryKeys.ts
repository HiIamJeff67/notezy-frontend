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
  userAccount: {
    all: () => ["userAccount"] as const,
    my: () => ["userAccount", "my"] as const,
  },
  rootShelf: {
    all: () => ["rootShelf"] as const,
    oneById: (rootShelfId: UUID | undefined) =>
      ["rootShelf", "oneById", rootShelfId] as const,
  },
  subShelf: {
    all: () => ["subShelf"] as const,
    oneById: (subShelfId?: UUID) =>
      ["subShelf", "oneById", subShelfId] as const,
    manyByPrevSubShelfId: (prevSubShelfId?: UUID | null) =>
      ["subShelf", "manyByPrevSubShelfId", prevSubShelfId] as const,
    manyByRootShelfId: (rootShelfId?: UUID) =>
      ["subShelf", "manyByRootShelfId", rootShelfId] as const,
  },
  material: {
    all: () => ["material"] as const,
    oneById: (id?: UUID, withParent: boolean = false) =>
      withParent
        ? (["material", "oneById", id, "withParent"] as const)
        : (["material", "oneById", id] as const),
    manyByParentSubShelfId: (parentSubShelfId?: UUID) =>
      ["material", "manyByParentSubShelfId", parentSubShelfId] as const,
    manyByRootShelfId: (rootShelfId?: UUID) =>
      ["material", "manyByRootShelfId", rootShelfId] as const,
  },
  blockPack: {
    all: () => ["blockPack"] as const,
    oneById: (id?: UUID, withParent: boolean = false) =>
      withParent
        ? (["blockPack", "oneById", id, "withParent"] as const)
        : (["blockPack", "oneById", id] as const),
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
  block: {
    all: () => ["block"] as const,
    myAll: () => ["block", "myAll"] as const,
    oneById: (id?: UUID) => ["block", "oneById", id] as const,
    manyByIds: (ids?: UUID[]) =>
      [
        "block",
        "manyByIds",
        ids && ids.length > 0 ? ids.slice().sort().join(",") : undefined,
      ] as const,
    manyByBlockGroupId: (blockGroupId?: UUID) =>
      ["block", "manyByBlockGroupId", blockGroupId] as const,
    manyByBlockGroupIds: (blockGroupIds?: UUID[]) =>
      [
        "block",
        "manyByBlockGroupIds",
        blockGroupIds && blockGroupIds.length > 0
          ? blockGroupIds.slice().sort().join(",")
          : undefined,
      ] as const,
    manyByBlockPackId: (blockPackId?: UUID) =>
      ["block", "manyByBlockPackId", blockPackId] as const,
  },
  blockPackWithBlockGroup: {
    all: () => ["blockPackWithBlockGroup"] as const,
    oneById: (blockPackId?: UUID) =>
      ["blockPackWithBlockGroup", "oneById", blockPackId] as const,
  },
  blockGroupWithBlock: {
    all: () => ["blockGroupWithBlock"] as const,
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
