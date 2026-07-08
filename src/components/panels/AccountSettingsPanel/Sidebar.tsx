import { Crown, Link, Settings, Shield, User, UserCog } from "lucide-react";
import { Fragment, memo } from "react";
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
    group: "個人",
  },
  {
    id: "account" as AccountSettingsPage,
    label: "帳戶設定",
    icon: Settings,
    group: "帳戶",
  },
  {
    id: "upgrade" as AccountSettingsPage,
    label: "升級方案",
    icon: Crown,
    group: "帳戶",
  },
  {
    id: "security" as AccountSettingsPage,
    label: "安全設定",
    icon: Shield,
    group: "安全",
  },
  {
    id: "binding" as AccountSettingsPage,
    label: "帳戶綁定",
    icon: Link,
    group: "安全",
  },
  {
    id: "accountModification" as AccountSettingsPage,
    label: "帳戶修改",
    icon: UserCog,
    group: "進階",
  },
];

const Sidebar = memo(({ currentPage, setCurrentPage }: SidebarProps) => {
  return (
    <div className="flex w-16 flex-col border-r border-border bg-card md:w-48 lg:w-64">
      <div className="border-b border-border p-2 md:p-4">
        <div className="flex justify-center md:hidden">
          <Settings className="size-5 text-muted-foreground" />
        </div>
        <h2 className="hidden text-base font-semibold text-foreground md:block">
          帳戶設定
        </h2>
      </div>

      <nav className="flex-1 p-1 md:p-2">
        <ul className="space-y-0.5">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const showGroupLabel =
              index === 0 || sidebarItems[index - 1].group !== item.group;

            return (
              <Fragment key={item.id}>
                {showGroupLabel && (
                  <li className="hidden px-2.5 pt-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground first:pt-0 md:block">
                    {item.group}
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex w-full items-center justify-center gap-0 rounded-sm px-2 py-1.5 text-left transition-colors md:justify-start md:gap-2 md:px-2.5 md:py-2 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                    }`}
                    title={item.label}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="hidden font-medium md:inline">
                      {item.label}
                    </span>
                  </button>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </nav>
    </div>
  );
});

export default Sidebar;
