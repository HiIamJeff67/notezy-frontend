import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SectionProps {
  children: ReactNode;
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: ReactNode;
  hideSeparator?: boolean;
  unsupportedReason?: string;
}

interface SwitchRowProps {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  hideSeparator?: boolean;
  unsupportedReason?: string;
}

export const Section = ({ children }: SectionProps) => (
  <section className="min-w-0">{children}</section>
);

export const SettingRow = ({
  title,
  description,
  children,
  hideSeparator,
  unsupportedReason,
}: SettingRowProps) => (
  <div
    className={`relative flex min-h-[calc(var(--density-control-height)+1.75rem)] items-center justify-between gap-[var(--density-content-gap)] overflow-hidden py-[calc(var(--density-content-padding)*0.75)] ${
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
      {unsupportedReason ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-density-static
          disabled
          className="h-8 px-3 text-xs"
        >
          {unsupportedReason}
        </Button>
      ) : (
        children
      )}
    </div>
    {unsupportedReason && (
      <div
        className="absolute inset-0 z-10 cursor-not-allowed bg-transparent"
        aria-label={unsupportedReason}
      />
    )}
  </div>
);

export const SwitchRow = ({
  title,
  description,
  checked,
  onCheckedChange,
  hideSeparator,
  unsupportedReason,
}: SwitchRowProps) => (
  <SettingRow
    title={title}
    description={description}
    hideSeparator={hideSeparator}
    unsupportedReason={unsupportedReason}
  >
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={Boolean(unsupportedReason)}
    />
  </SettingRow>
);

export const StatusPill = ({ children }: { children: ReactNode }) => (
  <span className="rounded-sm border border-border bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
    {children}
  </span>
);
