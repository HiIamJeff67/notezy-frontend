import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Link2, RefreshCcw, Shield, User } from "lucide-react";
import { AccountSettingsPage } from "./AccountSettingsPanel";

const sidebarItems: {
  id: AccountSettingsPage;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "profile", label: "個人資訊", icon: User },
  { id: "upgrade", label: "升級", icon: CreditCard },
  { id: "security", label: "安全性", icon: Shield },
  { id: "binding", label: "綁定", icon: Link2 },
  { id: "accountModification", label: "帳戶變更", icon: RefreshCcw },
];

interface SidebarProps {
  currentPage: AccountSettingsPage;
  setCurrentPage: (page: AccountSettingsPage) => void;
}

const Sidebar = ({ currentPage, setCurrentPage }: SidebarProps) => {
  return (
    <div className="w-50 max-w-7/20 bg-muted/50 border-r flex flex-col">
      <DialogHeader className="p-6 pb-4">
        <DialogTitle className="text-lg font-semibold">帳戶設置</DialogTitle>
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
  );
};

export default Sidebar;
