import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { ClipboardIcon, DatabaseIcon, HardDriveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Section, SettingRow, StatusPill, SwitchRow } from "../PreferenceRows";

const OfflineTab = () => {
  const {
    clipboardState,
    copyPreferences,
    preferences,
    storageEstimate,
    storageUsagePercent,
    updatePreference,
  } = useLocalPreferences();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Section
        title="本機資料"
        icon={DatabaseIcon}
        footer={<StatusPill>{storageUsagePercent}% used</StatusPill>}
      >
        <SwitchRow
          title="本機資料庫"
          checked={preferences.localVault}
          onCheckedChange={checked => updatePreference("localVault", checked)}
        />
        <SwitchRow
          title="離線佇列"
          checked={preferences.offlineQueue}
          onCheckedChange={checked => updatePreference("offlineQueue", checked)}
        />
        <SwitchRow
          title="附件快取"
          checked={preferences.cacheAttachments}
          onCheckedChange={checked =>
            updatePreference("cacheAttachments", checked)
          }
        />
        <SettingRow title="清理週期">
          <div className="flex w-56 items-center gap-3">
            <Slider
              value={[preferences.cleanupAfterDays]}
              min={7}
              max={90}
              step={1}
              onValueChange={value =>
                updatePreference("cleanupAfterDays", value[0] ?? 30)
              }
            />
            <span className="w-12 text-right text-sm font-semibold">
              {preferences.cleanupAfterDays}d
            </span>
          </div>
        </SettingRow>
        <SettingRow title="偏好匯出" hideSeparator>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyPreferences}
          >
            <ClipboardIcon className="size-4" />
            {clipboardState === "copied"
              ? "已複製"
              : clipboardState === "failed"
                ? "失敗"
                : "複製"}
          </Button>
        </SettingRow>
      </Section>

      <section className="rounded-md border border-border bg-background/45 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HardDriveIcon className="size-4 text-emerald-700" />
          儲存配額
        </div>
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary"
              style={{ width: `${storageUsagePercent}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {Math.round((storageEstimate?.usage ?? 0) / 1024 / 1024)} MB used
            </span>
            <span>
              {Math.round((storageEstimate?.quota ?? 0) / 1024 / 1024)} MB quota
            </span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-sm border border-border bg-muted/35 p-3 text-xs">
            <div className="text-muted-foreground">Vault</div>
            <div className="mt-1 font-semibold">
              {preferences.localVault ? "ON" : "OFF"}
            </div>
          </div>
          <div className="rounded-sm border border-border bg-muted/35 p-3 text-xs">
            <div className="text-muted-foreground">Queue</div>
            <div className="mt-1 font-semibold">
              {preferences.offlineQueue ? "ON" : "OFF"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OfflineTab;
