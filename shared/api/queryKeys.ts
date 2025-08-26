import { UUID } from "@shared/types/uuid_v4.type";
import { GetMeRequest, GetUserDataRequest } from "./interfaces/user.interface";
import { GetMyInfoRequest } from "./interfaces/userInfo.interface";

export const queryKeys = {
  user: {
    all: () => ["user"] as const,
    data: (request?: GetUserDataRequest) => ["user", "data", request] as const,
    me: (request?: GetMeRequest) => ["user", "me", request] as const,
  },
  userInfo: {
    all: () => ["userInfo"] as const,
    my: (request?: GetMyInfoRequest) => ["userInfo", "my", request] as const,
  },
  shelf: {
    all: () => ["shelf"] as const,
    myOrShared: (shelfId: UUID) => ["shelf", "myOrShared", shelfId],
    other: (shelfId: UUID) => ["shelf", "other", shelfId],
  },
};
