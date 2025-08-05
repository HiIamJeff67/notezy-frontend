"use client";

import { GetMyInfo } from "@/api/userInfo.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks";
import { useUserData } from "@/hooks/useUserData";
import {
  CreditCard,
  Link2,
  RefreshCcw,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type AccountSettingsPage =
  | "profile"
  | "upgrade"
  | "security"
  | "binding"
  | "reset"
  | "delete";

const sidebarItems: {
  id: AccountSettingsPage;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "profile", label: "個人資訊", icon: User },
  { id: "upgrade", label: "升級", icon: CreditCard },
  { id: "security", label: "安全性", icon: Shield },
  { id: "binding", label: "綁定", icon: Link2 },
  { id: "reset", label: "重置", icon: RefreshCcw },
  { id: "delete", label: "註銷帳號", icon: Trash2 },
];

interface AccountSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSettingsPanel = ({
  isOpen,
  onClose,
}: AccountSettingsPanelProps) => {
  const languageManager = useLanguage();
  const userDataManager = useUserData();
  const [currentPage, setCurrentPage] =
    useState<AccountSettingsPage>("profile");
  const [profileTab, setProfileTab] = useState<"user" | "userInfo">("user");

  const user = {
    publicId: userDataManager.userData?.publicId,
    name: userDataManager.userData?.name,
    displayName: userDataManager.userData?.displayName,
    email: userDataManager.userData?.email,
    role: userDataManager.userData?.role,
    plan: userDataManager.userData?.plan,
    status: userDataManager.userData?.status,
    updatedAt: userDataManager.userData?.updatedAt.toString(),
    createdAt: userDataManager.userData?.createdAt.toString(),
    info: {
      avatarURL: userDataManager.userData?.avatarURL,
      coverBackgroundURL: "",
      header: "歡迎來到 Notezy",
      introduction: "這是我的自我介紹",
      gender: "其他",
      country: "台灣",
      birthDate: "2000-01-01",
      updatedAt: "2024-07-31",
    },
  };

  const prepareUser = async function (): Promise<void> {
    try {
      const userAgent = navigator.userAgent;
      const responseOfGettingMyInfo = await GetMyInfo({
        header: {
          userAgent: userAgent,
        },
      });

      // probably use useState instead
      user.info.avatarURL = responseOfGettingMyInfo.data.avatarURL;
      user.info.coverBackgroundURL =
        responseOfGettingMyInfo.data.coverBackgroundURL;
      user.info.header = responseOfGettingMyInfo.data.header;
      user.info.introduction = responseOfGettingMyInfo.data.introduction;
      user.info.gender = responseOfGettingMyInfo.data.gender;
      user.info.country = responseOfGettingMyInfo.data.country;
      user.info.birthDate = responseOfGettingMyInfo.data.birthDate.toString();
      user.info.updatedAt = responseOfGettingMyInfo.data.updatedAt.toString();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4/5 p-0 overflow-hidden">
        <div className="flex h-[520px]">
          {/* Sidebar */}
          <div className="w-50 max-w-7/20 bg-muted/50 border-r flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-lg font-semibold">
                帳戶設置
              </DialogTitle>
            </DialogHeader>
            <nav className="flex-1 px-4 pb-4">
              <ul className="space-y-1">
                {sidebarItems.map(item => {
                  const Icon = item.icon as React.ComponentType<
                    React.SVGProps<SVGSVGElement>
                  >;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentPage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                          currentPage === item.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          {/* Content */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="mb-4 text-xl font-bold">
                帳戶設置
              </DialogTitle>
            </DialogHeader>
            <Separator className="mb-4" />
            {/* 個人資訊 */}
            {currentPage === "profile" && (
              <Tabs
                value={profileTab}
                onValueChange={v => setProfileTab(v as "user" | "userInfo")}
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="userInfo">UserInfo</TabsTrigger>
                </TabsList>
                <TabsContent value="user">
                  <div className="space-y-4">
                    <Label>私密個人資訊</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>公開ID</Label>
                        <Input value={user.publicId} readOnly />
                      </div>
                      <div>
                        <Label>帳戶名稱</Label>
                        <Input value={user.name} readOnly />
                      </div>
                      <div>
                        <Label>名稱</Label>
                        <Input value={user.displayName} />
                      </div>
                      <div>
                        <Label>電子郵件</Label>
                        <Input value={user.email} readOnly />
                      </div>
                      <div>
                        <Label>角色</Label>
                        <Input value={user.role} readOnly />
                      </div>
                      <div>
                        <Label>方案</Label>
                        <Input value={user.plan} readOnly />
                      </div>
                      <div>
                        <Label>狀態</Label>
                        <Input value={user.status} />
                      </div>
                      <div>
                        <Label>加入日期</Label>
                        <Input value={user.createdAt} readOnly />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="userInfo">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>背景橫幅</Label>
                        <Input value={user.info.coverBackgroundURL} />
                      </div>
                      <div>
                        <Label>大頭貼</Label>
                        <Input value={user.info.avatarURL} />
                      </div>
                      <div>
                        <Label>個人標題</Label>
                        <Input value={user.info.header} />
                      </div>
                      <div>
                        <Label>自我介紹</Label>
                        <Input value={user.info.introduction} />
                      </div>
                      <div>
                        <Label>性別</Label>
                        <Input value={user.info.gender} />
                      </div>
                      <div>
                        <Label>國家</Label>
                        <Input value={user.info.country} />
                      </div>
                      <div>
                        <Label>生日</Label>
                        <Input value={user.info.birthDate} />
                      </div>
                      <div>
                        <Label>上次修改</Label>
                        <Input value={user.info.updatedAt} readOnly />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            {/* 升級 */}
            {currentPage === "upgrade" && (
              <div className="space-y-6">
                <Label>升級方案</Label>
                <div className="flex gap-4">
                  <Button variant="outline">Free</Button>
                  <Button variant="outline">Pro</Button>
                  <Button variant="outline">Ultimate</Button>
                  <Button variant="outline">Enterprise</Button>
                </div>
                <Label>付款週期</Label>
                <div className="flex gap-4">
                  <Button variant="outline">月付</Button>
                  <Button variant="outline">年付</Button>
                </div>
              </div>
            )}
            {/* 安全性 */}
            {currentPage === "security" && (
              <div className="space-y-6">
                <Button variant="outline">驗證電子郵件</Button>
                <Button variant="outline">帳戶異常紀錄</Button>
                <Button variant="outline">帳號信譽</Button>
              </div>
            )}
            {/* 綁定 */}
            {currentPage === "binding" && (
              <div className="space-y-6">
                <Button variant="outline">綁定備用電子郵件</Button>
                <Button variant="outline">綁定電話號碼</Button>
                <Button variant="outline">綁定 Gmail</Button>
                <Button variant="outline">綁定 Meta</Button>
                <Button variant="outline">綁定 Discord</Button>
              </div>
            )}
            {/* 重置 */}
            {currentPage === "reset" && (
              <div className="space-y-6">
                <Button variant="outline">重置密碼</Button>
                <Button variant="outline">重置綁定手機號碼</Button>
              </div>
            )}
            {/* 註銷帳號 */}
            {currentPage === "delete" && (
              <div className="space-y-6">
                <Button variant="destructive">註銷帳號</Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsPanel;
