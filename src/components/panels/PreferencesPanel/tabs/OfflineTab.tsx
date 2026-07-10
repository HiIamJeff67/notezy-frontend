import { useLocalPreferences } from "@/hooks/localPreferences";
import { HardDriveIcon } from "lucide-react";
import { Section, SettingRow, SwitchRow } from "../PreferenceRows";

const formatStorageSize = (bytes = 0) => {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
};

const OfflineTab = () => {
  const {
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
          description="準備用來控制 Notezy 是否在瀏覽器本機保存工作資料。"
          checked={preferences.localVault}
          onCheckedChange={checked => updatePreference("localVault", checked)}
          unsupportedReason="待串接"
        />
        <SwitchRow
          title="離線佇列"
          description="準備用來控制離線操作是否先排入本機佇列，等連線恢復後再同步。"
          checked={preferences.offlineQueue}
          onCheckedChange={checked => updatePreference("offlineQueue", checked)}
          unsupportedReason="待串接"
        />
        <SwitchRow
          title="附件快取"
          description="準備用來控制近期附件是否保存在本機快取。"
          checked={preferences.cacheAttachments}
          onCheckedChange={checked =>
            updatePreference("cacheAttachments", checked)
          }
          unsupportedReason="待串接"
        />
        <SettingRow
          title="清理週期"
          description="準備用來設定本機快取資料的保留天數。"
          unsupportedReason="待串接"
        >
          <span className="text-sm font-semibold">
            {preferences.cleanupAfterDays}d
          </span>
        </SettingRow>
      </Section>

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <HardDriveIcon className="size-4 text-primary" />
          本機儲存估算
        </div>
        <div className="mt-1 text-xs leading-5 text-muted-foreground">
          由瀏覽器回報目前網站的使用量與估算上限，不代表 Notezy 已保留這些空間。
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
              已使用 {formatStorageSize(storageEstimate?.usage)}
            </span>
            <span>
              估算上限 {formatStorageSize(storageEstimate?.quota)}
            </span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-sm border border-border bg-muted/35 p-3 text-xs">
            <div className="text-muted-foreground">Vault</div>
            <div className="mt-1 font-semibold">待串接</div>
          </div>
          <div className="rounded-sm border border-border bg-muted/35 p-3 text-xs">
            <div className="text-muted-foreground">Queue</div>
            <div className="mt-1 font-semibold">待串接</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OfflineTab;
