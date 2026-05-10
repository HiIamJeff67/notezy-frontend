import type {
  DeleteMeResponse,
  LoginResponse,
  LoginViaGoogleResponse,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  RegisterViaGoogleResponse,
  ResetEmailRequest,
  ResetEmailResponse,
  ResetMeResponse,
} from "@shared/api/interfaces/auth.interface";
import { UserStatus } from "@shared/api/interfaces/enums";
import { localDB } from "@shared/api/local/db";
import {
  ensureLocalDBReadyForWrites,
  getLatestLocalDBMigrationVersion,
} from "@shared/api/local/migrator";
import { RootShelf } from "@shared/api/local/schemas";
import { User } from "@shared/api/local/schemas/user.schema";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { eq } from "drizzle-orm";

export class AuthLocalAdaptor {
  private static async ensureLocalDBReady(): Promise<void> {
    const currentVersion =
      LocalStorageManipulator.getItemByKey(
        LocalStorageKey.currentLocalDBVersion
      ) ?? "-1";
    const targetVersion = getLatestLocalDBMigrationVersion();
    const result = await ensureLocalDBReadyForWrites({
      currentVersion,
      targetVersion,
    });
    LocalStorageManipulator.setItem(
      LocalStorageKey.currentLocalDBVersion,
      result.finalVersion
    );
  }

  static async syncRegister(
    request: RegisterRequest,
    response: RegisterResponse
  ): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: request.body.name,
          displayName: response.data.displayName,
          email: request.body.email,
          isLoggedIn: true,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoNothing({ target: User.publicId });
    });
  }

  static async syncRegisterViaGoogle(
    response: RegisterViaGoogleResponse
  ): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
          isLoggedIn: true,
          updatedAt: response.data.createdAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoNothing({ target: User.publicId });
    });
  }

  static async syncLogin(response: LoginResponse): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
          isLoggedIn: true,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoNothing({ target: User.publicId });
    });
  }

  static async syncLoginViaGoogle(
    response: LoginViaGoogleResponse
  ): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB.transaction(async tx => {
      await tx.update(User).set({ isLoggedIn: false });
      await tx
        .insert(User)
        .values({
          publicId: response.data.publicId,
          name: response.data.name,
          displayName: response.data.displayName,
          email: response.data.email,
          isLoggedIn: true,
          updatedAt: response.data.updatedAt,
          createdAt: response.data.createdAt,
        })
        .onConflictDoNothing({ target: User.publicId });
    });
  }

  static async syncLogout(response: LogoutResponse): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB.transaction(async tx => {
      await tx
        .update(User)
        .set({
          status: UserStatus.Offline,
          isLoggedIn: false,
        })
        .where(eq(User.publicId, response.embedded.publicId));
      await tx.update(User).set({ isLoggedIn: false }); // just to make sure there's no users are logged in
    });
  }

  static async syncResetEmail(
    request: ResetEmailRequest,
    response: ResetEmailResponse
  ): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB
      .update(User)
      .set({
        email: request.body.newEmail,
      })
      .where(eq(User.publicId, response.embedded.publicId));
  }

  static async syncResetMe(response: ResetMeResponse): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB
      .delete(RootShelf)
      .where(eq(RootShelf.ownerPublicId, response.embedded.publicId));
  }

  static async syncDeleteMe(response: DeleteMeResponse): Promise<void> {
    await this.ensureLocalDBReady();
    await localDB.transaction(async tx => {
      await tx
        .delete(User)
        .where(eq(User.publicId, response.embedded.publicId));
      await tx.update(User).set({ isLoggedIn: false }); // just to make sure there's no users are logged in
    });
  }
}
