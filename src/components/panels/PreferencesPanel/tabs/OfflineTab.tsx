import { Button } from "@/components/ui/button";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useRealtime } from "@/hooks/useRealtime";
import { LocalYjsDocumentStore } from "@shared/blockpack/core";
import toast from "@shared/lib/toast";
import { DatabaseIcon, HardDriveIcon, ImageIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  const backgroundImages = useBackgroundImages();
  const { activeBlockPackChannelCount } = useRealtime();
  const [backgroundCache, setBackgroundCache] = useState({
    totalBytes: 0,
    count: 0,
  });
  const [yjsCache, setYjsCache] = useState({ totalSize: 0, count: 0 });

  const refreshCacheUsage = useCallback(async () => {
    const [backgroundEstimate, yjsEstimate] = await Promise.all([
      backgroundImages.getCacheEstimate(),
      LocalYjsDocumentStore.estimate(),
    ]);
    setBackgroundCache({
      totalBytes: backgroundEstimate.totalBytes,
      count: backgroundEstimate.count,
    });
    setYjsCache(yjsEstimate);
  }, [backgroundImages]);

  useEffect(() => {
    void refreshCacheUsage();
  }, [refreshCacheUsage]);

  const clearUnusedBackgroundImages = async () => {
    await backgroundImages.clearUnused();
    await refreshCacheUsage();
    toast.success("Unused background images cleared.");
  };

  const clearAllBackgroundImages = async () => {
    if (!window.confirm("Clear all local background images?")) return;
    await backgroundImages.clearAll();
    await refreshCacheUsage();
    toast.success("Background image cache cleared.");
  };

  const clearLocalYjsDocuments = async () => {
    if (activeBlockPackChannelCount > 0) {
      toast.error("Close active BlockPack editors before clearing Yjs cache.");
      return;
    }
    if (!window.confirm("Clear local Yjs document recovery cache?")) return;
    await LocalYjsDocumentStore.clear();
    await refreshCacheUsage();
    toast.success("Local Yjs document cache cleared.");
  };

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
        <SettingRow
          title="Yjs 文件快取"
          description="用於瀏覽器關閉、離線或重連後恢復 BlockPack 協作文件。"
        >
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">
              {yjsCache.count} docs · {formatStorageSize(yjsCache.totalSize)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={activeBlockPackChannelCount > 0}
              onClick={clearLocalYjsDocuments}
            >
              清除
            </Button>
          </div>
        </SettingRow>
        <SettingRow
          title="背景圖片快取"
          description="本機背景圖片上限為 1 GB；新增圖片前會先檢查瀏覽器剩餘配額。"
          hideSeparator
        >
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-muted-foreground">
              {backgroundCache.count} images ·{" "}
              {formatStorageSize(backgroundCache.totalBytes)}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={clearUnusedBackgroundImages}
              >
                清除未使用
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={clearAllBackgroundImages}
              >
                全部清除
              </Button>
            </div>
          </div>
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
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DatabaseIcon className="size-3.5" />
              Yjs docs
            </div>
            <div className="mt-1 font-semibold">
              {formatStorageSize(yjsCache.totalSize)}
            </div>
          </div>
          <div className="rounded-sm border border-border bg-muted/35 p-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ImageIcon className="size-3.5" />
              Images
            </div>
            <div className="mt-1 font-semibold">
              {formatStorageSize(backgroundCache.totalBytes)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OfflineTab;
