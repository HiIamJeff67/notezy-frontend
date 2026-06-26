import type { PreferencePage } from "@shared/api/hooks/localPreferences.hook";
import type { LucideIcon } from "lucide-react";
import { SlidersHorizontalIcon } from "lucide-react";
import { memo } from "react";

interface SidebarProps {
  currentPage: PreferencePage;
  items: { id: PreferencePage; label: string; icon: LucideIcon }[];
  setCurrentPage: (page: PreferencePage) => void;
}

const Sidebar = memo(({ currentPage, items, setCurrentPage }: SidebarProps) => {
  return (
    <aside className="flex w-16 flex-col border-r border-border bg-card md:w-48 lg:w-64">
      <div className="border-b border-border p-2 md:p-6">
        <div className="flex justify-center md:hidden">
          <SlidersHorizontalIcon className="size-6 text-muted-foreground" />
        </div>
        <h2 className="hidden text-lg font-semibold text-foreground md:block">
          偏好設定
        </h2>
      </div>

      <nav className="flex-1 p-1 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex w-full items-center justify-center gap-0 rounded-lg px-2 py-2 text-left transition-colors md:justify-start md:gap-3 md:px-4 md:py-3 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  title={item.label}
                >
                  <Icon className="size-6 shrink-0 md:size-5" />
                  <span className="hidden font-medium md:inline">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
});

export default Sidebar;
