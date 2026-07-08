import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

interface SectionProps {
  children: ReactNode;
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: ReactNode;
  hideSeparator?: boolean;
}

interface SwitchRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hideSeparator?: boolean;
}

export const Section = ({ children }: SectionProps) => (
  <section className="min-w-0">{children}</section>
);

export const SettingRow = ({
  title,
  description,
  children,
  hideSeparator,
}: SettingRowProps) => (
  <div
    className={`flex min-h-16 items-center justify-between gap-5 py-3 ${
      !hideSeparator ? "border-b border-border/50" : ""
    }`}
  >
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium">{title}</div>
      {description && (
        <div className="mt-1 text-sm leading-5 text-muted-foreground">
          {description}
        </div>
      )}
    </div>
    <div className="flex shrink-0 items-center justify-end gap-2">
      {children}
    </div>
  </div>
);

export const SwitchRow = ({
  title,
  description,
  checked,
  onCheckedChange,
  hideSeparator,
}: SwitchRowProps) => (
  <SettingRow
    title={title}
    description={description}
    hideSeparator={hideSeparator}
  >
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </SettingRow>
);

export const StatusPill = ({ children }: { children: ReactNode }) => (
  <span className="rounded-sm border border-border bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
    {children}
  </span>
);
