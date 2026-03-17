"use client";

import SettingMenu from "@/components/menus/SettingMenu/SettingMenu";
import SettingMenuButton from "@/components/menus/SettingMenu/SettingMenuButton";
import SettingMenuItem from "@/components/menus/SettingMenu/SettingMenuItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppRouter, useLanguage, useLoading, useUser } from "@/hooks";
import {
  useDeleteMe,
  useForgetPassword,
  useResetEmail,
  useResetMe,
} from "@shared/api/hooks/auth.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { UserRole } from "@shared/enums";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

interface AccountModificationTabProps {
  sendAuthCodeTimeCounter: number;
  setSendAuthCodeTimeCounter: (newSendAuthCodeTimeCounter: number) => void;
  isSendAuthCodePending: boolean;
  handleSendAuthCode: (
    onSuccess?: () => void,
    onBlock?: () => void,
    fallback?: () => void
  ) => void;
  onPanelClose: () => void;
}

const AccountModificationTab = ({
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
  onPanelClose,
}: AccountModificationTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();

  const resetMeMutator = useResetMe();
  const resetEmailMutator = useResetEmail();
  const forgetPasswordMutator = useForgetPassword();
  const deleteMeMutator = useDeleteMe();

  const [resetMeDialogOpen, setResetMeDialogOpen] = useState<boolean>(false);
  const [resetEmailDialogOpen, setResetEmailDialogOpen] =
    useState<boolean>(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState<boolean>(false);
  const [deleteMeDialogOpen, setDeleteMeDialogOpen] = useState<boolean>(false);

  const handleResetMe = useCallback(
    async (authCode: string): Promise<void> =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const csrfToken = SessionStorageManipulator.getItemByKey(
            SessionStorageKey.csrfToken
          );
          await resetMeMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              csrfToken: csrfToken ?? "",
            },
            body: {
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setResetMeDialogOpen(false);
          const accessToken = LocalStorageManipulator.getItemByKey(
            LocalStorageKey.accessToken
          );
          userManager.fetchUserData(accessToken);
          onPanelClose();
          toast.success("Your account has been reset");
          router.push(WebURLPathDictionary.root.dashboard._);
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      router,
      userManager,
      languageManager,
      resetMeMutator,
      setSendAuthCodeTimeCounter,
      setResetMeDialogOpen,
      SessionStorageManipulator,
      SessionStorageKey,
      onPanelClose,
    ]
  );

  const handleResetEmail = useCallback(
    async (newEmail: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const csrfToken = SessionStorageManipulator.getItemByKey(
            SessionStorageKey.csrfToken
          );
          await resetEmailMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              csrfToken: csrfToken ?? "",
            },
            body: {
              newEmail: newEmail,
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setResetEmailDialogOpen(false);
          userManager.updateUserData({ email: newEmail });
          toast.success("Your email has been reset");
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      userManager,
      languageManager,
      resetEmailMutator,
      setSendAuthCodeTimeCounter,
      setResetEmailDialogOpen,
      SessionStorageManipulator,
      SessionStorageKey,
    ]
  );

  const handleChangePassword = useCallback(
    async (newPassword: string, confirmPassword: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (newPassword !== confirmPassword) {
            throw new Error(
              "The new password and confirm password does not match"
            );
          }

          if (userManager.userData?.email === undefined) {
            router.push(WebURLPathDictionary.home);
            userManager.logout();
            throw new Error("The user session is expired, please login again");
          }

          const userAgent = navigator.userAgent;
          await forgetPasswordMutator.mutateAsync({
            header: {
              userAgent: userAgent,
            },
            body: {
              account: userManager.userData?.email,
              newPassword: newPassword,
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setChangePasswordDialogOpen(false);
          toast.success("Your password has been changed");
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      userManager,
      languageManager,
      forgetPasswordMutator,
      setSendAuthCodeTimeCounter,
      setChangePasswordDialogOpen,
      onPanelClose,
    ]
  );

  const handleDeleteMe = useCallback(
    async (confirmDeleteText: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          if (confirmDeleteText !== "DELETE") {
            throw new Error(
              'Please enter the word "DELETE" to delete your account'
            );
          }

          const userAgent = navigator.userAgent;
          const csrfToken = SessionStorageManipulator.getItemByKey(
            SessionStorageKey.csrfToken
          );
          await deleteMeMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              csrfToken: csrfToken ?? "",
            },
            body: {
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setDeleteMeDialogOpen(false);
          onPanelClose();
          userManager.setUserData(null);
          toast.success("Your account has been deleted");
          router.push(WebURLPathDictionary.home);
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      router,
      userManager,
      languageManager,
      deleteMeMutator,
      setSendAuthCodeTimeCounter,
      setDeleteMeDialogOpen,
      onPanelClose,
    ]
  );

  return (
    <SettingMenu
      dialogs={[
        <Dialog open={resetMeDialogOpen} onOpenChange={setResetMeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>重置帳戶</DialogTitle>
              <DialogDescription>
                {`這將會清除你的所有個人資料，包括筆記、設定等。此操作無法復原。如果您仍確認要重置，${
                  userManager.userData?.email
                    ? `請輸入我們剛剛寄到
                ${userManager.userData?.email} 的驗證碼來完成驗證。`
                    : "請輸入驗證碼來完成驗證。"
                }`}
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                await handleResetMe(authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="authCode"
                  name="authCode"
                  type="number"
                  inputMode="numeric"
                  placeholder="輸入驗證碼"
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required
                  className="w-full px-4 py-3"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={sendAuthCodeTimeCounter > 0}
                  onClick={() => handleSendAuthCode()}
                  className="absolute right-0.5 max-w-2/5 top-1/2 px-3 -translate-y-1/2 text-xs font-bold"
                >
                  {sendAuthCodeTimeCounter > 0
                    ? `${sendAuthCodeTimeCounter}s 後重送`
                    : "重送驗證碼"}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setResetMeDialogOpen(false)}
                >
                  取消
                </Button>
                <Button variant="destructive" type="submit">
                  確認重置
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={resetEmailDialogOpen}
          onOpenChange={setResetEmailDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>更改電子郵件</DialogTitle>
              <DialogDescription>
                請確保輸入跟舊電子郵件不同的新電子郵件
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                const newEmail = formData.get("newEmail") as string;
                await handleResetEmail(authCode, newEmail);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  placeholder="輸入新電子郵件"
                  required
                  className="w-full px-4 py-3"
                />
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="authCode"
                  name="authCode"
                  type="number"
                  inputMode="numeric"
                  placeholder="輸入驗證碼"
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required
                  className="w-full px-4 py-3"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={sendAuthCodeTimeCounter > 0}
                  onClick={() => handleSendAuthCode()}
                  className="absolute right-0.5 max-w-2/5 top-1/2 px-3 -translate-y-1/2 text-xs font-bold"
                >
                  {sendAuthCodeTimeCounter > 0
                    ? `${sendAuthCodeTimeCounter}s 後重送`
                    : "重送驗證碼"}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setResetEmailDialogOpen(false)}
                >
                  取消
                </Button>
                <Button variant="destructive" type="submit">
                  確認更改
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={changePasswordDialogOpen}
          onOpenChange={setChangePasswordDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>更改密碼</DialogTitle>
              <DialogDescription>請輸入你的舊密碼和新密碼</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newPassword = formData.get("newPassword") as string;
                const confirmPassword = formData.get(
                  "confirmPassword"
                ) as string;
                const authCode = formData.get("authCode") as string;
                await handleChangePassword(
                  newPassword,
                  confirmPassword,
                  authCode
                );
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="輸入新密碼"
                  required
                  className="mt-1"
                />
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="輸入確認密碼"
                  required
                  className="mt-1"
                />
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="authCode"
                  name="authCode"
                  type="number"
                  inputMode="numeric"
                  placeholder="輸入驗證碼"
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required
                  className="w-full px-4 py-3"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={sendAuthCodeTimeCounter > 0}
                  onClick={() => handleSendAuthCode()}
                  className="absolute right-0.5 max-w-2/5 top-1/2 px-3 -translate-y-1/2 text-xs font-bold"
                >
                  {sendAuthCodeTimeCounter > 0
                    ? `${sendAuthCodeTimeCounter}s 後重送`
                    : "重送驗證碼"}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangePasswordDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">更新密碼</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog open={deleteMeDialogOpen} onOpenChange={setDeleteMeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">
                永久刪除帳戶
              </DialogTitle>
              <DialogDescription>
                <strong>警告：</strong>
                這將永久刪除你的帳戶和所有資料，包括所有筆記、個人設定和帳戶資訊。此操作無法復原。
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = (formData.get("authCode") ?? "") as string;
                const confirmDeleteText = formData.get(
                  "confirmDeleteText"
                ) as string;
                await handleDeleteMe(confirmDeleteText, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="authCode"
                  name="authCode"
                  type="number"
                  inputMode="numeric"
                  placeholder="輸入驗證碼"
                  autoComplete="one-time-code"
                  maxLength={6}
                  minLength={6}
                  required={userManager.userData?.role !== UserRole.Guest}
                  className="w-full px-4 py-3"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={sendAuthCodeTimeCounter > 0}
                  onClick={() => handleSendAuthCode()}
                  className="absolute right-0.5 max-w-2/5 top-1/2 px-3 -translate-y-1/2 text-xs font-bold"
                >
                  {sendAuthCodeTimeCounter > 0
                    ? `${sendAuthCodeTimeCounter}s 後重送`
                    : "重送驗證碼"}
                </Button>
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="confirmDeleteText"
                  name="confirmDeleteText"
                  type="text"
                  placeholder="輸入 DELETE 來確認刪除"
                  required
                  className="w-full px-4 py-3"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteMeDialogOpen(false);
                  }}
                >
                  取消
                </Button>
                <Button variant="destructive" type="submit">
                  永久刪除
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
      ]}
    >
      <SettingMenuItem
        title="重置帳戶"
        description="將你的帳戶回復到初始狀態，清除所有個人資料但保留帳戶"
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setResetMeDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          重置
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title="更改電子郵件"
        description={`變更當前綁定的電子郵件${userManager.userData?.email && `(${userManager.userData.email})`}`}
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setResetEmailDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          更改
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title="更改密碼"
        description="更新你的帳戶密碼以確保安全性"
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setChangePasswordDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          更改
        </SettingMenuButton>
      </SettingMenuItem>

      <SettingMenuItem
        title="刪除帳戶"
        description="永久刪除該帳號並無法再存取任何內部資訊"
        titleClassName="text-destructive"
        hideSeparator
      >
        <SettingMenuButton
          variant="destructive"
          onClick={() => {
            setDeleteMeDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          刪除
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default AccountModificationTab;
