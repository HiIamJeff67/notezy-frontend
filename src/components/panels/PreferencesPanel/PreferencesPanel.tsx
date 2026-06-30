import type { PreferencePage } from "@shared/api/hooks/localPreferences.hook";
import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import type { LucideIcon } from "lucide-react";
import {
  BellIcon,
  BookOpenIcon,
  FocusIcon,
  HardDriveIcon,
  InfoIcon,
  PaletteIcon,
  ShieldIcon,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Sidebar from "./Sidebar";
import AboutTab from "./tabs/AboutTab";
import AppearanceTab from "./tabs/AppearanceTab";
import AppearanceTabSkeleton from "./tabs/AppearanceTabSkeleton";
import EditorTab from "./tabs/EditorTab";
import EditorTabSkeleton from "./tabs/EditorTabSkeleton";
import FocusTab from "./tabs/FocusTab";
import NotificationsTab from "./tabs/NotificationsTab";
import OfflineTab from "./tabs/OfflineTab";
import OfflineTabSkeleton from "./tabs/OfflineTabSkeleton";
import PrivacyTab from "./tabs/PrivacyTab";

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { id: "appearance", label: "外觀", icon: PaletteIcon },
  { id: "editor", label: "編輯器", icon: BookOpenIcon },
  { id: "focus", label: "專注", icon: FocusIcon },
  { id: "offline", label: "離線資料", icon: HardDriveIcon },
  { id: "privacy", label: "隱私", icon: ShieldIcon },
  { id: "notifications", label: "通知", icon: BellIcon },
  { id: "about", label: "關於", icon: InfoIcon },
] satisfies { id: PreferencePage; label: string; icon: LucideIcon }[];

const PreferencesPanel = ({ isOpen, onClose }: PreferencesPanelProps) => {
  const [currentPage, setCurrentPage] = useState<PreferencePage>("appearance");
  const { isReady } = useLocalPreferences();

  const activePage =
    sidebarItems.find(item => item.id === currentPage) ?? sidebarItems[0];

  const ActiveIcon = activePage.icon;

  const currentTab = (() => {
    if (!isReady) {
      if (currentPage === "appearance") return <AppearanceTabSkeleton />;
      if (currentPage === "editor") return <EditorTabSkeleton />;
      if (currentPage === "offline") return <OfflineTabSkeleton />;
    }

    switch (currentPage) {
      case "appearance":
        return <AppearanceTab />;
      case "editor":
        return <EditorTab />;
      case "focus":
        return <FocusTab />;
      case "offline":
        return <OfflineTab />;
      case "privacy":
        return <PrivacyTab />;
      case "notifications":
        return <NotificationsTab />;
      case "about":
        return <AboutTab />;
    }
  })();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="min-w-4/5 overflow-hidden border-none p-0 [&_[data-slot=select-trigger]]:border-border [&_[data-slot=select-trigger]]:bg-card/45 [&_[data-slot=select-trigger]]:hover:bg-card/60 [&_[data-slot=select-trigger]]:focus-visible:bg-card/60 [&_input]:border-border [&_input]:bg-card/45 [&_input]:hover:bg-card/60 [&_input]:focus-visible:bg-card/60 [&_textarea]:border-border [&_textarea]:bg-card/45 [&_textarea]:hover:bg-card/60 [&_textarea]:focus-visible:bg-card/60">
        <DialogTitle className="sr-only">偏好設定</DialogTitle>
        <div className="flex h-[520px]">
          <Sidebar
            currentPage={currentPage}
            items={sidebarItems}
            setCurrentPage={setCurrentPage}
          />

          <main className="h-[520px] flex-1 overflow-y-auto bg-muted px-8 pt-10 pb-8 [scrollbar-color:var(--muted-foreground)_var(--secondary)]!">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                  <ActiveIcon className="size-5 shrink-0 text-emerald-700" />
                  {activePage.label}
                </h2>
              </div>
            </div>

            {currentTab}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesPanel;
