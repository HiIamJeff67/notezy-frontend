import { useLocalPreferences } from "@/hooks/localPreferences";
import { ClipboardIcon, HardDriveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Section, SettingRow, SwitchRow } from "../PreferenceRows";

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
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
      <Section>
        <SwitchRow
          title="本機資料庫"
          description="允許 Notezy 在瀏覽器本機保存工作資料，用於更快載入與離線使用。"
          checked={preferences.localVault}
          onCheckedChange={checked => updatePreference("localVault", checked)}
        />
        <SwitchRow
          title="離線佇列"
          description="離線時先把操作排入本機佇列，等連線恢復後再同步處理。"
          checked={preferences.offlineQueue}
          onCheckedChange={checked => updatePreference("offlineQueue", checked)}
        />
        <SwitchRow
          title="附件快取"
          description="快取近期看過的附件，提升再次開啟速度，但會增加本機儲存用量。"
          checked={preferences.cacheAttachments}
          onCheckedChange={checked =>
            updatePreference("cacheAttachments", checked)
          }
        />
        <SettingRow
          title="清理週期"
          description="設定本機快取資料的保留天數，到期後由客戶端優先清理。"
        >
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
        <SettingRow
          title="偏好匯出"
          description="把目前本機偏好複製成 JSON，方便你之後手動備份或回報問題。"
          hideSeparator
        >
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

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HardDriveIcon className="size-4 text-primary" />
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
