"use client";

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
import {
  Bell,
  Database,
  FileText,
  Globe,
  Palette,
  Settings,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreferencePage =
  | "appearance"
  | "language"
  | "notifications"
  | "editor"
  | "privacy"
  | "data"
  | "about";

const PreferencesPanel = ({ isOpen, onClose }: PreferencesPanelProps) => {
  const languageManager = useLanguage();
  const themeManager = useTheme();
  const [currentPage, setCurrentPage] = useState<PreferencePage>("appearance");

  const sidebarItems = [
    { id: "appearance" as PreferencePage, label: "外觀", icon: Palette },
    { id: "language" as PreferencePage, label: "語言", icon: Globe },
    { id: "notifications" as PreferencePage, label: "通知", icon: Bell },
    { id: "editor" as PreferencePage, label: "編輯器", icon: FileText },
    { id: "privacy" as PreferencePage, label: "隱私", icon: Shield },
    { id: "data" as PreferencePage, label: "數據", icon: Database },
    { id: "about" as PreferencePage, label: "關於", icon: Settings },
  ];

  const renderPageContent = () => {
    switch (currentPage) {
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">外觀設置</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">主題</Label>
                      <p className="text-sm text-muted-foreground">
                        選擇應用程式的外觀主題
                      </p>
                    </div>
                    <Select
                      value={themeManager.currentTheme?.id}
                      onValueChange={value =>
                        themeManager.switchCurrentTheme(value)
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="選擇主題" />
                      </SelectTrigger>
                      <SelectContent>
                        {themeManager.availableThemes.map(theme => (
                          <SelectItem key={theme.id} value={theme.id}>
                            {languageManager.t(theme.translationKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">深色模式</Label>
                      <p className="text-sm text-muted-foreground">
                        啟用深色介面
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">緊湊模式</Label>
                      <p className="text-sm text-muted-foreground">
                        減少介面元素的間距
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">動畫效果</Label>
                      <p className="text-sm text-muted-foreground">
                        啟用介面動畫和轉場效果
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">語言設置</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">界面語言</Label>
                      <p className="text-sm text-muted-foreground">
                        選擇應用程式的顯示語言
                      </p>
                    </div>
                    <Select
                      value={languageManager.currentLanguage?.key}
                      onValueChange={value => {
                        const language =
                          languageManager.availableLanguages.find(
                            lang => lang.key === value
                          );
                        if (language) {
                          languageManager.setCurrentLanguage(language);
                        }
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="選擇語言" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageManager.availableLanguages.map(language => (
                          <SelectItem key={language.key} value={language.key}>
                            {language.nativeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">
                        自動檢測語言
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        根據系統設定自動選擇語言
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">翻譯功能</Label>
                      <p className="text-sm text-muted-foreground">
                        啟用內建翻譯工具
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">通知設置</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">桌面通知</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">電子郵件通知</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">聲音提醒</Label>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">同步完成通知</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">錯誤通知</Label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        );

      case "editor":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">編輯器設置</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">自動保存</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">拼字檢查</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">行號顯示</Label>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">字體大小</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">小 (12px)</SelectItem>
                      <SelectItem value="medium">中 (14px)</SelectItem>
                      <SelectItem value="large">大 (16px)</SelectItem>
                      <SelectItem value="xlarge">特大 (18px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">縮排方式</Label>
                  <Select defaultValue="spaces">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spaces">空格</SelectItem>
                      <SelectItem value="tabs">Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">隱私設置</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">數據收集</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">錯誤報告</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">使用統計</Label>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">清除數據</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      清除快取
                    </Button>
                    <Button variant="outline" size="sm">
                      清除歷史
                    </Button>
                    <Button variant="destructive" size="sm">
                      重置所有設置
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">數據管理</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">自動同步</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">離線模式</Label>
                  <Switch />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">備份與還原</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      立即備份
                    </Button>
                    <Button variant="outline" size="sm">
                      還原備份
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">匯出數據</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      匯出 JSON
                    </Button>
                    <Button variant="outline" size="sm">
                      匯出 Markdown
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">關於 Notezy</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">版本資訊</Label>
                  <p className="text-sm text-muted-foreground">Notezy v1.0.0</p>
                  <p className="text-sm text-muted-foreground">
                    構建時間：2024-01-01
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">支援</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      說明文檔
                    </Button>
                    <Button variant="outline" size="sm">
                      聯繫支援
                    </Button>
                    <Button variant="outline" size="sm">
                      回報問題
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">法律資訊</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      使用條款
                    </Button>
                    <Button variant="outline" size="sm">
                      隱私政策
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-3/5 max-h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="flex w-full h-full">
          <div className="w-3/10 bg-muted/30 border-r flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-xl font-semibold">
                偏好設置
              </DialogTitle>
            </DialogHeader>

            <nav className="flex-1 px-3 pb-4">
              <ul className="space-y-1">
                {sidebarItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentPage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left ${
                          currentPage === item.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon size={16} />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* 主要內容區域 - 移除重複的關閉按鈕，增加寬度 */}
          <div className="flex-1 flex flex-col min-w-7/10">
            <div className="flex-1 overflow-y-auto p-8">
              {renderPageContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesPanel;
