import SettingMenu from "@/components/SettingMenu/SettingMenu";
import SettingMenuButton from "@/components/SettingMenu/SettingMenuButton";
import SettingMenuItem from "@/components/SettingMenu/SettingMenuItem";
import { useAppRouter, useLanguage, useLoading, useUser } from "@/hooks";
import { useUpdateMyAccount } from "@shared/api/hooks/userAccount.hook";
import { WebURLPathDictionary } from "@shared/constants";
import { AllCountryCodes, CountryCode } from "@shared/enums";
import { getOAuthGoogleSearchParamsString } from "@shared/lib/getURL";
import { SessionStorageManipulator } from "@shared/lib/sessionStorageManipulator";
import { CSRFTokenGenerator } from "@shared/lib/tokenGenerator";
import { SessionStorageKey } from "@shared/types/sessionStorage.type";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface BindTabProps {
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

const BindingTab = ({
  sendAuthCodeTimeCounter,
  setSendAuthCodeTimeCounter,
  isSendAuthCodePending,
  handleSendAuthCode,
  onPanelClose,
}: BindTabProps) => {
  const router = useAppRouter();
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const userManager = useUser();

  const updateUserAccountMutator = useUpdateMyAccount();

  const [bindBackupEmailDialogOpen, setBindBackupEmailDialogOpen] =
    useState<boolean>(false);
  const [bindPhoneNumberDialogOpen, setBindPhoneNumberDialogOpen] =
    useState<boolean>(false);

  const countryCodeOptions = useMemo(
    () => [
      <SelectItem
        key="NO_COUNTRY_CODE"
        value="NO_COUNTRY_CODE"
        className="text-muted-foreground"
      >
        未設定國家代碼
      </SelectItem>,
      ...AllCountryCodes.map(countryCode => (
        <SelectItem key={countryCode} value={countryCode}>
          {countryCode}
        </SelectItem>
      )),
    ],
    []
  );

  const handleBindBackupEmail = useCallback(
    async (backupEmail: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const csrfToken = SessionStorageManipulator.getItemByKey(
            SessionStorageKey.csrfToken
          );
          await updateUserAccountMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              csrfToken: csrfToken ?? "",
            },
            body: {
              authCode: authCode,
              values: {
                backupEmail: backupEmail,
              },
            },
          });
          setSendAuthCodeTimeCounter(0);
          setBindBackupEmailDialogOpen(false);
          toast.success("Your backup email has been set");
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      router,
      userManager,
      languageManager,
      updateUserAccountMutator,
      setSendAuthCodeTimeCounter,
      setBindBackupEmailDialogOpen,
    ]
  );

  const handleBindPhoneNumber = useCallback(
    async (countryCode: CountryCode, phoneNumber: string, authCode: string) =>
      await loadingManager.startAsyncTransactionLoading(async () => {
        try {
          const userAgent = navigator.userAgent;
          const csrfToken = SessionStorageManipulator.getItemByKey(
            SessionStorageKey.csrfToken
          );
          await updateUserAccountMutator.mutateAsync({
            header: {
              userAgent: userAgent,
              csrfToken: csrfToken ?? "",
            },
            body: {
              authCode: authCode,
              values: {
                countryCode: countryCode,
                phoneNumber: phoneNumber,
              },
            },
          });
          setSendAuthCodeTimeCounter(0);
          setBindPhoneNumberDialogOpen(false);
          toast.success("Your phone number has been set");
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      router,
      userManager,
      languageManager,
      updateUserAccountMutator,
      setSendAuthCodeTimeCounter,
      setBindPhoneNumberDialogOpen,
    ]
  );

  return (
    <SettingMenu
      dialogs={[
        <Dialog
          open={bindBackupEmailDialogOpen}
          onOpenChange={setBindBackupEmailDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>綁定備用電子郵件</DialogTitle>
              <DialogDescription>
                請輸入備用電子郵件以及驗證碼，並確保這個電子郵件與您當初註冊用的不同。
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const backupEmail = formData.get("backupEmail") as string;
                const authCode = formData.get("authCode") as string;
                await handleBindBackupEmail(backupEmail, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="backupEmail"
                  name="backupEmail"
                  type="email"
                  placeholder="輸入備用電子郵件"
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
                  onClick={() => setBindBackupEmailDialogOpen(false)}
                >
                  取消
                </Button>
                <Button variant="destructive" type="submit">
                  確認綁定
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
        <Dialog
          open={bindPhoneNumberDialogOpen}
          onOpenChange={setBindPhoneNumberDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>綁定電話號碼</DialogTitle>
              <DialogDescription>請輸入電話號碼以及驗證碼。</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              method="POST"
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const countryCode = formData.get("countryCode") as CountryCode;
                const phoneNumber = formData.get("phoneNumber") as string;
                const authCode = formData.get("authCode") as string;
                await handleBindPhoneNumber(countryCode, phoneNumber, authCode);
              }}
            >
              <div className="relative flex justify-between items-center mt-1">
                <Select name="countryCode" required>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇國家代碼" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>國家代碼</SelectLabel>
                      <SelectSeparator />
                      {countryCodeOptions}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex justify-between items-center mt-1">
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="phone"
                  placeholder="輸入電話號碼"
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
                  onClick={() => setBindPhoneNumberDialogOpen(false)}
                >
                  取消
                </Button>
                <Button variant="destructive" type="submit">
                  確認綁定
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>,
      ]}
    >
      <SettingMenuItem
        title="綁定備用電子郵件"
        description="綁定備用電子郵件以在忘記帳號或密碼時透過它來找回"
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setBindBackupEmailDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="綁定電話號碼"
        description="綁定電話號碼已提高帳戶可信度"
      >
        <SettingMenuButton
          variant="outline"
          onClick={() => {
            setBindPhoneNumberDialogOpen(true);
            handleSendAuthCode();
          }}
        >
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="綁定 Gmail 賬號"
        description="綁定 Gmail 帳號可在登入時快速登入"
      >
        <SettingMenuButton
          variant="outline"
          onClick={() =>
            router.forceNavigate(
              WebURLPathDictionary.oauth.google(
                getOAuthGoogleSearchParamsString({
                  csrfToken: CSRFTokenGenerator.generate(),
                  action: "binding",
                  from: router.getCurrentPath(),
                })
              )
            )
          }
        >
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="綁定 Meta 賬號"
        description="綁定 Meta 帳號可在登入時快速登入"
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="綁定 Discord 賬號"
        description="綁定 Discord 帳號可在登入時快速使用"
        hideSeparator
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
    </SettingMenu>
  );
};

export default BindingTab;
