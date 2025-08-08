import { ReactNode } from "react";

interface SettingMenuItemProps {
  title: string;
  description: string;
  children: ReactNode;
  isLast?: boolean;
  titleClassName?: string;
}

const SettingMenuItem = ({
  title,
  description,
  children,
  isLast = false,
  titleClassName = "",
}: SettingMenuItemProps) => {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        !isLast ? "border-b border-border/50" : ""
      }`}
    >
      <div className="flex-1">
        <div className={`text-sm font-medium ${titleClassName}`}>{title}</div>
        <div className="text-sm text-muted-foreground mt-1">{description}</div>
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
};

export default SettingMenuItem;
