import { Crown, Link, Settings, Shield, User, UserCog } from "lucide-react";
import { memo } from "react";
import { AccountSettingsPage } from "./AccountSettingsPanel";

interface SidebarProps {
  currentPage: AccountSettingsPage;
  setCurrentPage: (page: AccountSettingsPage) => void;
}

const sidebarItems = [
  {
    id: "profile" as AccountSettingsPage,
    label: "個人資料",
    icon: User,
  },
  {
    id: "account" as AccountSettingsPage,
    label: "帳戶設定",
    icon: Settings,
  },
  {
    id: "upgrade" as AccountSettingsPage,
    label: "升級方案",
    icon: Crown,
  },
  {
    id: "security" as AccountSettingsPage,
    label: "安全設定",
    icon: Shield,
  },
  {
    id: "binding" as AccountSettingsPage,
    label: "帳戶綁定",
    icon: Link,
  },
  {
    id: "accountModification" as AccountSettingsPage,
    label: "帳戶修改",
    icon: UserCog,
  },
];

const Sidebar = memo(({ currentPage, setCurrentPage }: SidebarProps) => {
  return (
    <div className="w-16 md:w-48 lg:w-64 bg-muted border-r border-border flex flex-col">
      <div className="p-2 md:p-6 border-b border-border">
        {/* 小螢幕只顯示圖示 */}
        <div className="flex justify-center md:hidden">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </div>
        {/* 大螢幕顯示標題 */}
        <h2 className="hidden md:block text-lg font-semibold text-foreground">
          設定
        </h2>
      </div>

      <nav className="flex-1 p-1 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    w-full flex items-center justify-center md:justify-start 
                    gap-0 md:gap-3
                    px-2 md:px-4 py-2 md:py-3 
                    rounded-lg transition-colors text-left
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }
                  `}
                  title={item.label} // 小螢幕的 tooltip
                >
                  <Icon className="w-6 h-6 md:w-5 md:h-5 flex-shrink-0" />
                  {/* 小螢幕隱藏文字，大螢幕顯示文字 */}
                  <span className="hidden md:inline font-medium">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
});

export default Sidebar;
