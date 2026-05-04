import { user } from "@shared/api/local/schemas/user.schema";
import { eq } from "drizzle-orm";
import { sqliteView } from "drizzle-orm/sqlite-core";
import { userAccount } from "./userAccount.schema";
import { userInfo } from "./userInfo.schema";
import { userSetting } from "./userSetting.schema";

// the same schemas as the userData in api interface and shard type,
// but we using view here for better maintaining and following up the single source of truth principle,
// so there's no need to maintain this data manually and it is also a read only model
export const userData = sqliteView("UserDataView").as(qb =>
  qb
    .select({
      publicId: user.publicId,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      status: user.status,
      avatarURL: userInfo.avatarURL,
      language: userSetting.language,
      generalSettingCode: userSetting.generalSettingCode,
      privacySettingCode: userSetting.privacySettingCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .leftJoin(userInfo, eq(userInfo.publicId, user.publicId))
    .leftJoin(userSetting, eq(userSetting.publicId, user.publicId))
    .leftJoin(userAccount, eq(userAccount.publicId, user.publicId))
);
