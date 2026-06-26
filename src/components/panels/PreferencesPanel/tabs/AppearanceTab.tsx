import type {
  Density,
  PanelDock,
} from "@shared/api/hooks/localPreferences.hook";
import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { PaletteIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage, useTheme } from "@/hooks";
import { Section, SettingRow, StatusPill, SwitchRow } from "../PreferenceRows";

const AppearanceTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();
  const languageManager = useLanguage();
  const themeManager = useTheme();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <Section title="介面外觀" icon={PaletteIcon}>
        <SettingRow title="主題">
          <Select
            value={themeManager.currentTheme.id}
            onValueChange={value => void themeManager.switchCurrentTheme(value)}
          >
            <SelectTrigger className="w-48 bg-muted">
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
        <SettingRow title="介面語言">
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
            <SelectTrigger className="w-48 bg-muted">
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
        <SettingRow title="密度">
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
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow title="面板停靠">
          <Select
            value={preferences.panelDock}
            onValueChange={value =>
              updatePreference("panelDock", value as PanelDock)
            }
          >
            <SelectTrigger className="w-36 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">左側</SelectItem>
              <SelectItem value="right">右側</SelectItem>
              <SelectItem value="floating">浮動</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SwitchRow
          title="低動態"
          checked={preferences.reduceMotion}
          onCheckedChange={checked => updatePreference("reduceMotion", checked)}
        />
        <SwitchRow
          title="操作回饋"
          checked={preferences.tactileFeedback}
          onCheckedChange={checked =>
            updatePreference("tactileFeedback", checked)
          }
          hideSeparator
        />
      </Section>

      <section className="rounded-md border border-border bg-background/45 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">視覺樣本</div>
          <StatusPill>{preferences.density}</StatusPill>
        </div>
        <div className="mt-4 rounded-sm border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2 w-24 rounded-full bg-foreground/75" />
              <div className="mt-2 h-2 w-36 rounded-full bg-muted-foreground/35" />
            </div>
            <div className="size-9 rounded-sm border border-emerald-900/40 bg-emerald-950/20" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className="h-14 rounded-sm border border-border bg-background/60"
              />
            ))}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-sm border border-border bg-muted/35 p-3">
            <div className="text-muted-foreground">Theme</div>
            <div className="mt-1 font-semibold">
              {themeManager.currentTheme.name}
            </div>
          </div>
          <div className="rounded-sm border border-border bg-muted/35 p-3">
            <div className="text-muted-foreground">Dock</div>
            <div className="mt-1 font-semibold">{preferences.panelDock}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppearanceTab;
