import { useSendAuthCode } from "@shared/api/hooks/auth.hook";
import { AuthCodeBlockedSecond, WebURLPathDictionary } from "@shared/constants";
import toast from "@shared/lib/toast";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppRouter, useLanguage, useNetwork, useUser } from "@/hooks";
import AccountModificationTab from "./AccountModificationTab";
import AccountTab from "./AccountTab";
import BindingTab from "./BindingTab";
import OfflineTab from "./OfflineTab";
import ProfileTabSkeleton from "./ProfileTabSkeleton";
import SecurityTab from "./SecurityTab";
import Sidebar from "./Sidebar";
import UpgradeTab from "./UpgradeTab";

const ProfileTab = lazy(() => import("./ProfileTab"));

export type AccountSettingsPage =
  | "profile"
  | "account"
  | "upgrade"
  | "security"
  | "binding"
  | "accountModification";

interface AccountSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSettingsPanel = ({
  isOpen,
  onClose,
}: AccountSettingsPanelProps) => {
  const router = useAppRouter();
  const languageManager = useLanguage();
  const userManager = useUser();
  const { isOnline } = useNetwork();

  const sendAuthCodeMutator = useSendAuthCode();

  const [currentPage, setCurrentPage] =
    useState<AccountSettingsPage>("profile");
  const [showProfileContent, setShowProfileContent] = useState(false);
  const [sendAuthCodeTimeCounter, setSendAuthCodeTimeCounter] =
    useState<number>(0);

  const [isSendAuthCodePending, startSendAuthCodeTransition] = useTransition();

  useEffect(() => {
    if (isOpen && currentPage === "profile") {
      setShowProfileContent(false);

      const timer = setTimeout(() => {
        setShowProfileContent(true);
      }, 200); // timeout to show the actual profile tab

      return () => clearTimeout(timer);
    }
  }, [isOpen, currentPage]);

  useEffect(() => {
    if (sendAuthCodeTimeCounter === 0) return;
    const timer = setInterval(() => {
      setSendAuthCodeTimeCounter(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sendAuthCodeTimeCounter]);

  const handleSendAuthCode = useCallback(
    (onSuccess?: () => void, onBlock?: () => void, fallback?: () => void) =>
      startSendAuthCodeTransition(async () => {
        try {
          if (sendAuthCodeTimeCounter > 0) {
            if (onBlock) onBlock();
            toast.error(
              `The auth code is already sent, please wait until ${sendAuthCodeTimeCounter} seconds later to resent again`
            );
            return; // return here to avoid sending another api request to send the auth code
          }
          if (userManager.userData?.email === undefined) {
            router.push(WebURLPathDictionary.home);
            userManager.logout();
            throw new Error("The user session is expired, please login again");
          }

          const userAgent = navigator.userAgent;
          const responseOfSendingAuthCode =
            await sendAuthCodeMutator.mutateAsync({
              header: {
                userAgent: userAgent,
              },
              body: {
                email: userManager.userData.email,
              },
            });

          const blockUntil = new Date(
            responseOfSendingAuthCode.data.blockAuthCodeUntil
          );
          const blockTime = Math.floor(
            (blockUntil.getTime() - new Date().getTime()) / 1000
          );
          if (onSuccess) onSuccess();
          setSendAuthCodeTimeCounter(
            Math.max(AuthCodeBlockedSecond, blockTime)
          );
          toast.success(
            `Auth code email sent, please check your email of ${userManager.userData.email}`
          );
        } catch (error) {
          if (fallback) fallback();
          setSendAuthCodeTimeCounter(0);
          toast.error(languageManager.tError(error));
        }
      }),
    [
      userManager,
      languageManager,
      sendAuthCodeMutator,
      sendAuthCodeTimeCounter,
      setSendAuthCodeTimeCounter,
    ]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="min-w-4/5 overflow-hidden border-none p-0 [&_[data-slot=select-trigger]]:border-border [&_[data-slot=select-trigger]]:bg-card/45 [&_[data-slot=select-trigger]]:hover:bg-card/60 [&_[data-slot=select-trigger]]:focus-visible:bg-card/60 [&_input]:border-border [&_input]:bg-card/45 [&_input]:hover:bg-card/60 [&_input]:focus-visible:bg-card/60 [&_textarea]:border-border [&_textarea]:bg-card/45 [&_textarea]:hover:bg-card/60 [&_textarea]:focus-visible:bg-card/60">
        <DialogTitle className="visibility: hidden"></DialogTitle>
        <div className="flex h-[520px]">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <div className="flex-1 h-[520px]">
            {!isOnline ? (
              <OfflineTab />
            ) : (
              <>
                {currentPage === "profile" &&
                  (!showProfileContent ? (
                    <ProfileTabSkeleton />
                  ) : (
                    <Suspense fallback={<ProfileTabSkeleton />}>
                      <ProfileTab />
                    </Suspense>
                  ))}
                {currentPage === "account" && <AccountTab />}
                {currentPage === "upgrade" && <UpgradeTab />}
                {currentPage === "security" && (
                  <SecurityTab
                    sendAuthCodeTimeCounter={sendAuthCodeTimeCounter}
                    setSendAuthCodeTimeCounter={setSendAuthCodeTimeCounter}
                    isSendAuthCodePending={isSendAuthCodePending}
                    handleSendAuthCode={handleSendAuthCode}
                  />
                )}
                {currentPage === "binding" && (
                  <BindingTab
                    sendAuthCodeTimeCounter={sendAuthCodeTimeCounter}
                    setSendAuthCodeTimeCounter={setSendAuthCodeTimeCounter}
                    isSendAuthCodePending={isSendAuthCodePending}
                    handleSendAuthCode={handleSendAuthCode}
                    onPanelClose={onClose}
                  />
                )}
                {currentPage === "accountModification" && (
                  <AccountModificationTab
                    sendAuthCodeTimeCounter={sendAuthCodeTimeCounter}
                    setSendAuthCodeTimeCounter={setSendAuthCodeTimeCounter}
                    isSendAuthCodePending={isSendAuthCodePending}
                    handleSendAuthCode={handleSendAuthCode}
                    onPanelClose={onClose}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsPanel;
