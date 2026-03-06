import { useAppRouter, useLanguage, useLoading, useUserData } from "@/hooks";
import SettingMenu from "../SettingMenu/SettingMenu";
import SettingMenuButton from "../SettingMenu/SettingMenuButton";
import SettingMenuItem from "../SettingMenu/SettingMenuItem";

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
  const userDataManager = useUserData();

  return (
    <SettingMenu>
      <SettingMenuItem
        title="綁定備用電子郵件"
        description="綁定另一個備用的電子郵件來提高帳戶安全性"
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="綁定電話號碼"
        description="綁定電話號碼已提高帳戶可信度"
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
          綁定
        </SettingMenuButton>
      </SettingMenuItem>
      <SettingMenuItem
        title="綁定 Gmail 賬號"
        description="綁定 Gmail 帳號可在登入時快速登入"
      >
        <SettingMenuButton variant="outline" onClick={() => {}}>
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
