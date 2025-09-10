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
  shelf: {
    all: () => ["shelf"] as const,
    myOrShared: (shelfId: UUID | undefined) =>
      ["shelf", "myOrShared", shelfId] as const,
    other: (shelfId: UUID | undefined) => ["shelf", "other", shelfId] as const,
  },
  material: {
    all: () => ["material"] as const,
    myOneOrSharedOne: (materialId: UUID | undefined) =>
      ["material", "myOneOrSharedOne", materialId] as const,
    myManyOrSharedMany: (rootShelfId: UUID | undefined) =>
      ["material", "myManyOrSharedMany", rootShelfId] as const,
  },
};
