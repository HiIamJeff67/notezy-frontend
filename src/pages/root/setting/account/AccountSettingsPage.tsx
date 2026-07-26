import { useSendAuthCode } from "@shared/api/hooks/auth.hook";
import { AuthCodeBlockedSecond, WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { Maximize2Icon, PanelRightOpenIcon } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Article,
  ArticleContent,
  type ArticleNavigationItem,
  ArticleNavigationSidebar,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
} from "@/components/commons/Article/Article";
import AccountModificationTab from "@/components/panels/AccountSettingsPanel/AccountModificationTab";
import AccountTab from "@/components/panels/AccountSettingsPanel/AccountTab";
import BindingTab from "@/components/panels/AccountSettingsPanel/BindingTab";
import OfflineTab from "@/components/panels/AccountSettingsPanel/OfflineTab";
import ProfileTab from "@/components/panels/AccountSettingsPanel/ProfileTab";
import SecurityTab from "@/components/panels/AccountSettingsPanel/SecurityTab";
import UpgradeTab from "@/components/panels/AccountSettingsPanel/UpgradeTab";
import { Button } from "@/components/ui/button";
import {
  useAppRouter,
  useLanguage,
  useNetwork,
  useSettingsDisplay,
  useUser,
} from "@/hooks";

const navigationItems = [
  {
    id: "personal",
    title: "個人",
    description: "管理公開個人資料、頭像與自我介紹。",
    weight: 5,
  },
  {
    id: "account",
    title: "帳戶",
    description: "檢視帳戶識別、方案與基本狀態。",
    weight: 3,
  },
  {
    id: "upgrade",
    title: "升級方案",
    description: "比較方案額度並選擇適合的工作規模。",
    weight: 4,
  },
  {
    id: "security",
    title: "安全",
    description: "驗證電子郵件並查看帳戶安全相關操作。",
    weight: 2,
  },
  {
    id: "binding",
    title: "帳戶綁定",
    description: "綁定備用聯絡方式與外部帳戶。",
    weight: 3,
  },
  {
    id: "account-modification",
    title: "帳戶修改",
    description: "處理帳戶重設與不可逆的修改操作。",
    weight: 4,
  },
] satisfies ArticleNavigationItem[];

const AccountSettingsPage = ({
  displayMode = "page",
}: {
  displayMode?: "page" | "sheet";
}) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userManager = useUser();
  const { isOnline } = useNetwork();
  const { openSheet, closeSheet } = useSettingsDisplay();
  const sendAuthCodeMutator = useSendAuthCode();
  const [sendAuthCodeTimeCounter, setSendAuthCodeTimeCounter] = useState(0);
  const [isSendAuthCodePending, startSendAuthCodeTransition] = useTransition();

  useEffect(() => {
    if (sendAuthCodeTimeCounter === 0) return;
    const timer = setInterval(() => {
      setSendAuthCodeTimeCounter(current => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sendAuthCodeTimeCounter]);

  const handleSendAuthCode = useCallback(
    (onSuccess?: () => void, onBlock?: () => void, fallback?: () => void) =>
      startSendAuthCodeTransition(async () => {
        try {
          if (sendAuthCodeTimeCounter > 0) {
            onBlock?.();
            toast.error(
              `The auth code is already sent, please wait until ${sendAuthCodeTimeCounter} seconds later to resent again`
            );
            return;
          }
          if (userManager.userData?.email === undefined) {
            router.push(WebURLPathDictionary.home);
            userManager.logout();
            throw new Error("The user session is expired, please login again");
          }

          const response = await sendAuthCodeMutator.mutateAsync({
            header: { userAgent: navigator.userAgent },
            body: { email: userManager.userData.email },
          });
          const blockTime = Math.floor(
            (new Date(response.data.blockAuthCodeUntil).getTime() -
              Date.now()) /
              1000
          );

          onSuccess?.();
          setSendAuthCodeTimeCounter(
            Math.max(AuthCodeBlockedSecond, blockTime)
          );
          toast.success(
            `Auth code email sent, please check your email of ${userManager.userData.email}`
          );
        } catch (error) {
          fallback?.();
          setSendAuthCodeTimeCounter(0);
          toast.error(languageManager.tError(error));
        }
      }),
    [
      languageManager,
      router,
      sendAuthCodeMutator,
      sendAuthCodeTimeCounter,
      userManager,
    ]
  );

  const authCodeProps = {
    sendAuthCodeTimeCounter,
    setSendAuthCodeTimeCounter,
    isSendAuthCodePending,
    handleSendAuthCode,
  };

  return (
    <div
      className={`relative h-full min-h-0 bg-canvas py-6 ${
        displayMode === "sheet" ? "px-2" : "px-4 sm:px-6 lg:px-3"
      } [&_.flex.flex-col.gap-5]:gap-[var(--density-content-gap)] [&_.flex.flex-col.gap-6]:gap-[var(--density-content-gap)]`}
    >
      <Button
        data-density-static
        type="button"
        variant="default"
        size="icon"
        className="absolute top-3 left-4 z-20 size-7 p-0 select-none bg-transparent text-foreground hover:bg-primary sm:left-6"
        aria-label={
          displayMode === "sheet"
            ? "Open settings as a page"
            : "Open settings in sheet"
        }
        title={displayMode === "sheet" ? "Open as page" : "Open in sheet"}
        onClick={() => {
          LocalStorageManipulator.setItem(
            LocalStorageKey.settingsDisplayMode,
            displayMode === "sheet" ? "page" : "sheet"
          );

          if (displayMode === "sheet") {
            closeSheet();
            router.push(WebURLPathDictionary.root.setting.account);
            return;
          }

          openSheet("account");
          router.push(WebURLPathDictionary.root.dashboard._);
        }}
      >
        {displayMode === "sheet" ? <Maximize2Icon /> : <PanelRightOpenIcon />}
      </Button>
      <Article className={displayMode === "sheet" ? "lg:gap-0" : undefined}>
        <ArticleNavigationSidebar
          items={navigationItems}
          paragraphBaseHeight={12}
          subParagraphBaseHeight={6}
          className={
            displayMode === "sheet" ? "hidden lg:block lg:w-16" : undefined
          }
        />
        <ArticleContent
          className={
            displayMode === "sheet"
              ? "px-4 pt-12 sm:px-6 lg:pl-0 lg:pr-14"
              : undefined
          }
        >
          <ArticleParagraph id="personal">
            <ArticleParagraphHeader>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Account settings
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                個人
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                調整其他人看見的個人資訊與介紹。
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <ProfileTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="account">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">帳戶</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                檢視帳戶本身的識別資訊、狀態與目前方案。
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <AccountTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="upgrade">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                升級方案
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                比較方案額度並選擇適合的工作規模。
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? <UpgradeTab layout="page" /> : <OfflineTab />}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="security">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">安全</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                驗證電子郵件並管理帳戶安全相關操作。
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? (
                <SecurityTab {...authCodeProps} layout="page" />
              ) : (
                <OfflineTab />
              )}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="binding">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                帳戶綁定
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                綁定備用聯絡方式與外部帳戶。
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? (
                <BindingTab
                  {...authCodeProps}
                  layout="page"
                  onPanelClose={() => {}}
                />
              ) : (
                <OfflineTab />
              )}
            </ArticleParagraphContent>
          </ArticleParagraph>

          <ArticleParagraphSeparator />

          <ArticleParagraph id="account-modification">
            <ArticleParagraphHeader>
              <h2 className="text-2xl font-semibold tracking-tight">
                帳戶修改
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                進行重設、變更電子郵件、密碼或永久刪除帳戶。
              </p>
            </ArticleParagraphHeader>
            <ArticleParagraphContent className="max-w-none text-foreground">
              {isOnline ? (
                <AccountModificationTab
                  {...authCodeProps}
                  layout="page"
                  onPanelClose={() =>
                    router.push(WebURLPathDictionary.root.dashboard._)
                  }
                />
              ) : (
                <OfflineTab />
              )}
            </ArticleParagraphContent>
          </ArticleParagraph>
        </ArticleContent>
      </Article>
    </div>
  );
};

export default AccountSettingsPage;
