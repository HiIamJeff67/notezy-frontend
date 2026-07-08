import type { PreferencePage } from "@/hooks/localPreferences";
import type { LucideIcon } from "lucide-react";
import { SlidersHorizontalIcon } from "lucide-react";
import { Fragment, memo } from "react";

interface SidebarProps {
  currentPage: PreferencePage;
  items: {
    id: PreferencePage;
    label: string;
    icon: LucideIcon;
    group: string;
  }[];
  setCurrentPage: (page: PreferencePage) => void;
}

const Sidebar = memo(({ currentPage, items, setCurrentPage }: SidebarProps) => {
  return (
    <aside className="flex w-16 flex-col border-r border-border bg-card md:w-48 lg:w-64">
      <div className="border-b border-border p-2 md:p-4">
        <div className="flex justify-center md:hidden">
          <SlidersHorizontalIcon className="size-5 text-muted-foreground" />
        </div>
        <h2 className="hidden text-base font-semibold text-foreground md:block">
          偏好設定
        </h2>
      </div>

      <nav className="flex-1 p-1 md:p-2">
        <ul className="space-y-0.5">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const showGroupLabel =
              index === 0 || items[index - 1].group !== item.group;

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
    </aside>
  );
});

export default Sidebar;
