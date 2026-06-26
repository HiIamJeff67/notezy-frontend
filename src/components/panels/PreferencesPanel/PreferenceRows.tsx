import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

interface SectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
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

export const Section = ({
  title,
  icon: Icon,
  children,
  footer,
}: SectionProps) => (
  <section className="rounded-md border border-border bg-background/45">
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-emerald-700" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {footer}
    </div>
    <div className="divide-y divide-border/70">{children}</div>
  </section>
);

export const SettingRow = ({
  title,
  description,
  children,
}: SettingRowProps) => (
  <div className="flex min-h-16 items-center justify-between gap-5 px-4 py-3">
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium">{title}</div>
      {description && (
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
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
  <span className="rounded-sm border border-emerald-900/50 bg-emerald-950/20 px-2 py-1 text-[11px] font-semibold text-emerald-500">
    {children}
  </span>
);
