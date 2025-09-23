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
    myOneById: (rootShelfId: UUID | undefined) =>
      ["rootShelf", "myOne", rootShelfId?.toString()] as const,
  },
  subShelf: {
    all: () => ["subShelf"] as const,
    myOneById: (subShelfId?: UUID) =>
      ["subShelf", "myOneById", subShelfId?.toString()] as const,
    myManyByPrevSubShelfId: (prevSubShelfId?: UUID) =>
      [
        "subShelf",
        "myManyByPrevSubShelfId",
        prevSubShelfId?.toString(),
      ] as const,
    myManyByRootShelfId: (rootShelfId?: UUID) =>
      ["subShelf", "myManyByRootShelfId", rootShelfId?.toString()] as const,
  },
  material: {
    all: () => ["material"] as const,
    myOneById: (id?: UUID) => ["material", "myOneById", id] as const,
    myManyByParentSubShelfId: (parentSubShelfId?: UUID) =>
      ["material", "myManyByParentSubShelfId", parentSubShelfId] as const,
    myManyByRootShelfId: (rootShelfId?: UUID) =>
      ["material", "myManyByRootShelfId", rootShelfId] as const,
  },
};
