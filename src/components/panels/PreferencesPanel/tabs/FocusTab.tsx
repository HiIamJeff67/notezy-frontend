import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { FocusIcon, SquareDashedMousePointerIcon } from "lucide-react";
import { Section, SwitchRow } from "../PreferenceRows";

const FocusTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Section title="專注環境" icon={FocusIcon}>
        <SwitchRow
          title="專注側軌"
          checked={preferences.focusRail}
          onCheckedChange={checked => updatePreference("focusRail", checked)}
        />
        <SwitchRow
          title="環境格線"
          checked={preferences.ambientGrid}
          onCheckedChange={checked => updatePreference("ambientGrid", checked)}
        />
        <SwitchRow
          title="植被點綴"
          checked={preferences.plantAccents}
          onCheckedChange={checked => updatePreference("plantAccents", checked)}
        />
        <SwitchRow
          title="淡化非作用面板"
          checked={preferences.dimInactivePanels}
          onCheckedChange={checked =>
            updatePreference("dimInactivePanels", checked)
          }
          hideSeparator
        />
      </Section>

      <section className="relative overflow-hidden rounded-md border border-border bg-background/45 p-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-700/60 to-transparent" />
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SquareDashedMousePointerIcon className="size-4 text-emerald-700" />
          工作台
        </div>
        <div className="mt-4 grid h-56 grid-cols-[44px_1fr] gap-3">
          <div
            className={`rounded-sm border border-border bg-muted/40 ${
              preferences.focusRail ? "" : "opacity-35"
            }`}
          >
            <div className="mx-auto mt-3 size-5 rounded-sm bg-emerald-900/40" />
            <div className="mx-auto mt-3 size-5 rounded-sm bg-muted-foreground/25" />
            <div className="mx-auto mt-3 size-5 rounded-sm bg-muted-foreground/25" />
          </div>
          <div className="relative overflow-hidden rounded-sm border border-border bg-muted/35 p-4">
            {preferences.ambientGrid && (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
            )}
            <div className="relative h-5 w-36 rounded-sm bg-foreground/70" />
            <div className="relative mt-3 h-3 w-48 rounded-sm bg-muted-foreground/35" />
            <div
              className={`relative mt-5 grid grid-cols-2 gap-3 ${
                preferences.dimInactivePanels ? "[&>div+div]:opacity-45" : ""
              }`}
            >
              <div className="h-20 rounded-sm border border-emerald-900/50 bg-emerald-950/20" />
              <div className="h-20 rounded-sm border border-border bg-background/55" />
            </div>
            {preferences.plantAccents && (
              <div className="absolute right-4 bottom-4 flex gap-1">
                <span className="h-5 w-2 rounded-full bg-emerald-800/70" />
                <span className="h-7 w-2 rounded-full bg-lime-900/70" />
                <span className="h-4 w-2 rounded-full bg-emerald-700/70" />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FocusTab;
