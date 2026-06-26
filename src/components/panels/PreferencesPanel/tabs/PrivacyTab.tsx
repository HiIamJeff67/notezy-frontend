import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { EyeOffIcon, ShieldIcon } from "lucide-react";
import { Section, SwitchRow } from "../PreferenceRows";

const PrivacyTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Section title="本機隱私" icon={ShieldIcon}>
        <SwitchRow
          title="還原上次工作區"
          checked={preferences.restoreLastWorkspace}
          onCheckedChange={checked =>
            updatePreference("restoreLastWorkspace", checked)
          }
        />
        <SwitchRow
          title="隱藏預覽標題"
          checked={preferences.privatePreviews}
          onCheckedChange={checked =>
            updatePreference("privatePreviews", checked)
          }
        />
        <SwitchRow
          title="剪貼簿防護"
          checked={preferences.clipboardGuard}
          onCheckedChange={checked =>
            updatePreference("clipboardGuard", checked)
          }
        />
        <SwitchRow
          title="本機診斷"
          checked={preferences.localDiagnostics}
          onCheckedChange={checked =>
            updatePreference("localDiagnostics", checked)
          }
        />
        <SwitchRow
          title="崩潰快照"
          checked={preferences.crashSnapshot}
          onCheckedChange={checked =>
            updatePreference("crashSnapshot", checked)
          }
          hideSeparator
        />
      </Section>

      <section className="rounded-md border border-border bg-background/45 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <EyeOffIcon className="size-4 text-emerald-700" />
          隱私狀態
        </div>
        <div className="mt-4 space-y-3">
          {[
            ["Restore", preferences.restoreLastWorkspace],
            ["Private title", preferences.privatePreviews],
            ["Clipboard", preferences.clipboardGuard],
            ["Diagnostics", preferences.localDiagnostics],
          ].map(([label, enabled]) => (
            <div
              key={label as string}
              className="flex items-center justify-between border-b border-border/60 pb-3 text-xs last:border-b-0 last:pb-0"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{enabled ? "ON" : "OFF"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PrivacyTab;
