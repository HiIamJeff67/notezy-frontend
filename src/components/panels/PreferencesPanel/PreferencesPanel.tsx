"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLanguage, useTheme } from "@/hooks";
import { Bell, Database, Info, Palette, Shield, Users } from "lucide-react";
import { useState } from "react";

type PreferencePage =
  | "appearance"
  | "privacy"
  | "community"
  | "notifications"
  | "about"
  | "data";

const sidebarItems: {
  id: PreferencePage;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "appearance", label: "外觀", icon: Palette },
  { id: "privacy", label: "隱私", icon: Shield },
  { id: "community", label: "社群", icon: Users },
  { id: "notifications", label: "通知", icon: Bell },
  { id: "about", label: "關於", icon: Info },
  { id: "data", label: "數據", icon: Database },
];

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PreferencesPanel = ({ isOpen, onClose }: PreferencesPanelProps) => {
  const languageManager = useLanguage();
  const themeManager = useTheme();
  const [currentPage, setCurrentPage] = useState<PreferencePage>("appearance");

  // fake data
  const userPublicId = "notezy-123456";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-4/5 p-0 overflow-hidden">
        <div className="flex h-[520px]">
          {/* Sidebar */}
          <div className="w-50 max-w-7/20 bg-muted/50 border-r flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-lg font-semibold">
                偏好設置
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
                偏好設置
              </DialogTitle>
            </DialogHeader>
            <Separator className="mb-4" />
            {currentPage === "appearance" && (
              <form className="space-y-6">
                <div>
                  <Label>主題</Label>
                  <Select
                    value={themeManager.currentTheme.id}
                    onValueChange={async value =>
                      await themeManager.switchCurrentTheme(value)
                    }
                  >
                    <SelectTrigger className="w-40 mt-1">
                      <SelectValue placeholder="選擇主題" />
                    </SelectTrigger>
                    <SelectContent>
                      {themeManager.availableThemes.map((theme, index) => {
                        return (
                          <SelectItem
                            key={index}
                            value={theme.id}
                            defaultChecked={
                              themeManager.currentTheme.id === theme.id
                            }
                          >
                            {languageManager.t(theme.translationKey)}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>字體大小</Label>
                  <Select>
                    <SelectTrigger className="w-32 mt-1">
                      <SelectValue placeholder="中" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">小</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="large">大</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>緊湊模式</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>動畫效果</Label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>介面語言</Label>
                  <Select>
                    <SelectTrigger className="w-32 mt-1">
                      <SelectValue placeholder="繁體中文" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            )}
            {currentPage === "privacy" && (
              <form className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>公開個人資料</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>使用情況統計</Label>
                  <Switch />
                </div>
                <Separator />
                <Button variant="link" className="px-0">
                  隱私政策
                </Button>
              </form>
            )}
            {currentPage === "community" && (
              <form className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>最佳化推薦</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>依照地區推薦</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>忽略陌生人邀請</Label>
                  <Switch />
                </div>
                <div>
                  <Label>邀請碼</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="rounded bg-muted px-2 py-1 text-xs font-mono">
                      {userPublicId}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(userPublicId)
                      }
                    >
                      複製
                    </Button>
                  </div>
                </div>
              </form>
            )}
            {currentPage === "notifications" && (
              <form className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>桌面通知</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>社群通知</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>好友邀請通知</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>電子郵件通知</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>同步完成通知</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>錯誤通知</Label>
                  <Switch />
                </div>
              </form>
            )}
            {currentPage === "about" && (
              <div className="space-y-4">
                <div>
                  <Label>版本資訊</Label>
                  <div className="text-sm text-muted-foreground">
                    Notezy v1.0.0
                  </div>
                </div>
                <Separator />
                <Button variant="link" className="px-0">
                  說明文檔
                </Button>
                <Button variant="link" className="px-0">
                  回報問題
                </Button>
                <Button variant="link" className="px-0">
                  使用條款
                </Button>
                <Button variant="link" className="px-0">
                  隱私政策
                </Button>
              </div>
            )}
            {currentPage === "data" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label>雲端自動同步</Label>
                  <Switch />
                </div>
                <div>
                  <Label>備份與還原</Label>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      立即備份
                    </Button>
                    <Button size="sm" variant="outline">
                      還原備份
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesPanel;
