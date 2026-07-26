import { LocalYjsDocumentStore } from "@shared/blockpack/core";
import toast from "@shared/lib/toast";
import { HardDriveIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Section,
  SettingRow,
  SwitchRow,
} from "@/components/panels/PreferencesPanel/PreferenceRows";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useLanguage, useTheme } from "@/hooks";
import type { Density, EditorWidth } from "@/hooks/localPreferences";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";
import { useRealtime } from "@/hooks/useRealtime";

const formatStorageSize = (bytes = 0) => {
  const mb = bytes / 1024 / 1024;

  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
};

const AppearanceSettings = () => {
  const { preferences, updatePreference } = useLocalPreferences();
  const languageManager = useLanguage();
  const themeManager = useTheme();

  return (
    <Section>
      <SettingRow
        title="主題"
        description="調整整個產品的色彩與明暗層次，會立即套用在目前裝置。"
      >
        <Select
          value={themeManager.currentTheme.id}
          onValueChange={value => void themeManager.switchCurrentTheme(value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="選擇主題" />
          </SelectTrigger>
          <SelectContent>
            {themeManager.availableThemes.map(theme => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="介面語言"
        description="切換介面顯示語言；內容本身不會被翻譯或改寫。"
      >
        <Select
          value={languageManager.currentLanguage.key}
          onValueChange={value => {
            const language = languageManager.availableLanguages.find(
              item => item.key === value
            );
            if (language) {
              languageManager.setCurrentLanguage(language);
            }
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="選擇語言" />
          </SelectTrigger>
          <SelectContent>
            {languageManager.availableLanguages.map(language => (
              <SelectItem key={language.key} value={language.key}>
                {language.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="密度"
        description="控制列表、按鈕和面板之間的間距，影響畫面資訊量。"
      >
        <div className="flex rounded-md border border-border bg-muted p-1">
          {[
            ["comfortable", "寬鬆"],
            ["balanced", "標準"],
            ["compact", "緊湊"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => updatePreference("density", value as Density)}
              className={`h-8 rounded-sm px-3 text-sm transition ${
                preferences.density === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SwitchRow
        title="低動態"
        description="減少轉場和動態效果，適合長時間工作或對動畫敏感時使用。"
        checked={preferences.reduceMotion}
        onCheckedChange={checked => updatePreference("reduceMotion", checked)}
      />
      <SwitchRow
        title="操作回饋"
        description="保留按鈕、切換和選取時的細微觸覺感與視覺回饋。"
        checked={preferences.tactileFeedback}
        onCheckedChange={checked =>
          updatePreference("tactileFeedback", checked)
        }
        unsupportedReason="尚未支援"
        hideSeparator
      />
    </Section>
  );
};

const EditorSettings = () => {
  const { preferences, updatePreference } = useLocalPreferences();

  return (
    <Section>
      <SettingRow
        title="頁面寬度"
        description="調整編輯區預設寬度，讓閱讀、書寫或整理大量內容更順手。"
      >
        <Select
          value={preferences.editorWidth}
          onValueChange={value =>
            updatePreference("editorWidth", value as EditorWidth)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="narrow">窄版</SelectItem>
            <SelectItem value="standard">標準</SelectItem>
            <SelectItem value="wide">寬版</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow
        title="文字尺寸"
        description="設定編輯器中的基準字級，只影響本機顯示偏好。"
      >
        <div className="flex w-52 shrink-0 items-center gap-3">
          <Slider
            value={[preferences.editorFontSize]}
            min={13}
            max={20}
            step={1}
            onValueChange={value =>
              updatePreference("editorFontSize", value[0] ?? 15)
            }
          />
          <span className="w-10 text-right text-sm font-semibold">
            {preferences.editorFontSize}px
          </span>
        </div>
      </SettingRow>

      <SwitchRow
        title="自動換行"
        description="讓長句自動折行，不需要水平捲動即可閱讀完整段落。"
        checked={preferences.lineWrap}
        onCheckedChange={checked => updatePreference("lineWrap", checked)}
      />
      <SwitchRow
        title="拼字檢查"
        description="使用瀏覽器本機拼字檢查能力輔助輸入，不會把內容送到 Notezy API。"
        checked={preferences.spellcheck}
        onCheckedChange={checked => updatePreference("spellcheck", checked)}
      />
      <SwitchRow
        title="快速插入列"
        description="在編輯時顯示常用插入工具，方便快速加入區塊、routine 或素材。"
        checked={preferences.quickInsert}
        onCheckedChange={checked => updatePreference("quickInsert", checked)}
      />
      <SwitchRow
        title="拖曳編輯列"
        description="顯示每個區塊左側的六點拖曳把手，用來移動或操作區塊。"
        checked={preferences.blockDragHandle}
        onCheckedChange={checked =>
          updatePreference("blockDragHandle", checked)
        }
        hideSeparator
      />
    </Section>
  );
};

const OfflineSettings = () => {
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
    <>
      <section className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4 border-b border-border/50 pb-[var(--density-content-padding)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HardDriveIcon className="size-4 text-primary" />
            本機儲存額度
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            瀏覽器回報的網站使用量與估算上限。
          </p>
        </div>

        <div className="min-w-0">
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary"
              style={{ width: `${storageUsagePercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>已使用 {formatStorageSize(storageEstimate?.usage)}</span>
            <span>上限 {formatStorageSize(storageEstimate?.quota)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <div>
            <div className="text-muted-foreground">Yjs 文件</div>
            <div className="mt-1 font-medium">
              {formatStorageSize(yjsCache.totalSize)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">背景圖片</div>
            <div className="mt-1 font-medium">
              {formatStorageSize(backgroundCache.totalBytes)}
            </div>
          </div>
        </div>
      </section>

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
    </>
  );
};

export { AppearanceSettings, EditorSettings, OfflineSettings };
