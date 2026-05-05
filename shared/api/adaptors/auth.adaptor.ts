import type {
  DeleteMeResponse,
  LoginRequest,
  LoginResponse,
  LoginViaGoogleResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterViaGoogleResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  ResetMeResponse,
  SendAuthCodeResponse,
  ValidateEmailResponse,
} from "@shared/api/interfaces/auth.interface";
import { localdb } from "@shared/api/local/db";
import { rootShelf, userAccount, userInfo } from "@shared/api/local/schemas";
import { user } from "@shared/api/local/schemas/user.schema";
import { userSetting } from "@shared/api/local/schemas/userSetting.schema";
import { UserRole, UserStatus } from "@shared/enums";
import { eq } from "drizzle-orm";

export class AuthAdaptors {
  static async syncLocaldbAfterRegister(
    request: RegisterRequest,
    response: RegisterResponse
  ): Promise<void> {
    await localdb
      .insert(user)
      .values({
        publicId: response.data.publicId,
        name: request.body.name,
        displayName: response.data.displayName,
        email: request.body.email,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: user.publicId });

    await localdb
      .insert(userInfo)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userInfo.publicId });

    await localdb
      .insert(userAccount)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userAccount.publicId });

    await localdb
      .insert(userSetting)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userSetting.publicId });
  }

  static async syncLocaldbAfterRegisterViaGoogle(
    response: RegisterViaGoogleResponse
  ): Promise<void> {
    await localdb
      .insert(user)
      .values({
        publicId: response.data.publicId,
        name: response.data.name,
        displayName: response.data.displayName,
        email: response.data.email,
        updatedAt: response.data.createdAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: user.publicId });

    await localdb
      .insert(userInfo)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userInfo.publicId });

    await localdb
      .insert(userAccount)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userAccount.publicId });

    await localdb
      .insert(userSetting)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userSetting.publicId });
  }

  static async syncLocaldbAfterLogin(response: LoginResponse): Promise<void> {
    await localdb
      .insert(user)
      .values({
        publicId: response.data.publicId,
        name: response.data.name,
        displayName: response.data.displayName,
        email: response.data.email,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: user.publicId });

    await localdb
      .insert(userInfo)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userInfo.publicId });

    await localdb
      .insert(userAccount)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userAccount.publicId });

    await localdb
      .insert(userSetting)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userSetting.publicId });
  }

  static async syncLocaldbAfterLoginViaGoogle(
    response: LoginViaGoogleResponse
  ): Promise<void> {
    await localdb
      .insert(user)
      .values({
        publicId: response.data.publicId,
        name: response.data.name,
        displayName: response.data.displayName,
        email: response.data.email,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: user.publicId });

    await localdb
      .insert(userInfo)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userInfo.publicId });

    await localdb
      .insert(userAccount)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userAccount.publicId });

    await localdb
      .insert(userSetting)
      .values({
        publicId: response.data.publicId,
        updatedAt: response.data.createdAt,
      })
      .onConflictDoNothing({ target: userSetting.publicId });
  }

  static async syncLocaldbAfterLogout(response: LogoutResponse): Promise<void> {
    await localdb
      .update(user)
      .set({
        status: UserStatus.Offline,
      })
      .where(eq(user.publicId, response.embedded.embeddedPublicId));
  }

  static async syncLocaldbAfterValidateEmail(
    response: ValidateEmailResponse
  ): Promise<void> {
    await localdb
      .update(user)
      .set({
        role: UserRole.Normal,
      })
      .where(eq(user.publicId, response.embedded.embeddedPublicId));
  }

  static async syncLocaldbAfterResetEmail(
    request: ResetEmailRequest,
    response: ResetEmailResponse
  ): Promise<void> {
    await localdb
      .update(user)
      .set({
        email: request.body.newEmail,
      })
      .where(eq(user.publicId, response.embedded.embeddedPublicId));
  }

  static async syncLocaldbAfterResetMe(
    response: ResetMeResponse
  ): Promise<void> {
    await localdb
      .delete(userInfo)
      .where(eq(userInfo.publicId, response.embedded.embeddedPublicId));

    await localdb
      .insert(userInfo)
      .values({
        publicId: response.embedded.embeddedPublicId,
        updatedAt: response.data.updatedAt,
      })
      .onConflictDoNothing({ target: userInfo.publicId });

    await localdb
      .delete(userSetting)
      .where(eq(userSetting.publicId, response.embedded.embeddedPublicId));

    await localdb
      .insert(userSetting)
      .values({
        publicId: response.embedded.embeddedPublicId,
        updatedAt: response.data.updatedAt,
      })
      .onConflictDoNothing({ target: userSetting.publicId });

    await localdb
      .delete(rootShelf)
      .where(eq(rootShelf.ownerPublicId, response.embedded.embeddedPublicId));
  }

  static async syncLocaldbAfterDeleteMe(
    _response: DeleteMeResponse
  ): Promise<void> {
    return;
  }
}
