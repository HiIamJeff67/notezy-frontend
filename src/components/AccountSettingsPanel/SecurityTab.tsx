"use client";

import { useAppRouter, useLanguage, useLoading, useUser } from "@/hooks";
import { Dialog } from "@radix-ui/react-dialog";
import { useValidateEmail } from "@shared/api/hooks/auth.hook";
import { UserRole } from "@shared/enums";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { SessionStorageKeys } from "@shared/types/sessionStorage.type";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import SettingMenu from "../SettingMenu/SettingMenu";
import SettingMenuButton from "../SettingMenu/SettingMenuButton";
import SettingMenuItem from "../SettingMenu/SettingMenuItem";
import { Button } from "../ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

interface SecurityTabProps {
  sendAuthCodeTimeCounter: number;
  setSendAuthCodeTimeCounter: (newSendAuthCodeTimeCounter: number) => void;
  isSendAuthCodePending: boolean;
  handleSendAuthCode: (
    onSuccess?: () => void,
    onBlock?: () => void,
    fallback?: () => void
  ) => void;
}

const SecurityTab = ({
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
}: SecurityTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();

  const validateEmailMutator = useValidateEmail();

  const [validateEmailDialogOpen, setValidateEmailDialogOpen] =
    useState<boolean>(false);
  const [accountRecordDialogOpen, setAccountRecordDialogOpen] =
    useState<boolean>(false);

  const handleValidateEmailOnClick = useCallback(
    async (authCode: string): Promise<void> =>
      loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const csrfToken = SessionStorageManipulator.getItemByKey(
            SessionStorageKeys.csrfToken
          );
          await validateEmailMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              csrfToken: csrfToken ?? "",
            },
            body: {
              authCode: authCode,
            },
          });
          setSendAuthCodeTimeCounter(0);
          setValidateEmailDialogOpen(false);
          userManager.updateUserData({ role: UserRole.Normal });
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      userManager,
      languageManager,
      validateEmailMutator,
      setSendAuthCodeTimeCounter,
      setValidateEmailDialogOpen,
      SessionStorageManipulator,
      SessionStorageKeys,
    ]
  );

  return (
    <SettingMenu
      dialogs={[
        <Dialog
          open={validateEmailDialogOpen}
          onOpenChange={setValidateEmailDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>驗證電子郵件</DialogTitle>
              <DialogDescription>
                {userManager.userData?.email
                  ? `請輸入我們剛剛寄到
                ${userManager.userData?.email} 的驗證碼來完成驗證`
                  : "請輸入驗證碼來完成驗證"}
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const authCode = formData.get("authCode") as string;
                await handleValidateEmailOnClick(authCode);
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
                  variant="outline"
                  onClick={() => setValidateEmailDialogOpen(false)}
                >
                  取消
                </Button>
                <Button variant="default" type="submit">
                  確認
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={accountRecordDialogOpen}
          onOpenChange={setAccountRecordDialogOpen}
        ></Dialog>,
      ]}
    >
      <SettingMenuItem
        title="驗證電子郵件"
        description="透過接收我們寄出的電子郵件並輸入附件內驗證碼完成驗證"
      >
        <SettingMenuButton
          variant="outline"
          onClick={() =>
            handleSendAuthCode(
              () => setValidateEmailDialogOpen(true),
              () => setValidateEmailDialogOpen(true)
            )
          }
          disable={
            userManager.userData?.role &&
            userManager.userData.role !== UserRole.Guest
          }
        >
          {userManager.userData?.role &&
          userManager.userData.role !== UserRole.Guest
            ? "已驗證"
            : "驗證"}
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="帳戶異常紀錄"
        description="點擊查看關於此帳戶最近的異常紀錄"
        hideSeparator
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          查看
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default SecurityTab;
