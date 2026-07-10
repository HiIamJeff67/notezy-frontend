import type { Density } from "@/hooks/localPreferences";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage, useTheme } from "@/hooks";
import { Section, SettingRow, StatusPill, SwitchRow } from "../PreferenceRows";

const AppearanceTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();
  const languageManager = useLanguage();
  const themeManager = useTheme();

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_280px]">
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

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">視覺樣本</div>
          <StatusPill>{preferences.density}</StatusPill>
        </div>

        <div className="mt-4 space-y-3 rounded-sm border border-border bg-muted/40 p-3">
          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="h-2 w-24 rounded-full bg-foreground/75" />
                <div className="mt-2 h-2 w-36 rounded-full bg-muted-foreground/35" />
              </div>
              <Switch defaultChecked aria-label="Preview switch" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" className="h-7 px-2 text-xs">
                Primary
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
              >
                Outline
              </Button>
              <Checkbox defaultChecked aria-label="Preview checkbox" />
            </div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            <Tabs defaultValue="notes">
              <TabsList className="h-7 rounded-md">
                <TabsTrigger value="notes" className="h-6 px-2 text-xs">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="tasks" className="h-6 px-2 text-xs">
                  Tasks
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-3 flex items-center gap-2">
              <Input
                readOnly
                value="Search components"
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppearanceTab;
