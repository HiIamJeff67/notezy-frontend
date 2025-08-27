import { UUID } from "@shared/types/uuid_v4.type";

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
    myOrShared: (shelfId: UUID) => ["shelf", "myOrShared", shelfId],
    other: (shelfId: UUID) => ["shelf", "other", shelfId],
  },
};
