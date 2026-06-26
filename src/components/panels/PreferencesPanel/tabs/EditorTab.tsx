import type {
  EditorWidth,
  PasteBehavior,
  StartSurface,
} from "@shared/api/hooks/localPreferences.hook";
import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { BookOpenIcon, KeyboardIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Section, SettingRow, SwitchRow } from "../PreferenceRows";

const EditorTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Section title="編輯器預設" icon={BookOpenIcon}>
        <SettingRow title="起始畫面">
          <Select
            value={preferences.startSurface}
            onValueChange={value =>
              updatePreference("startSurface", value as StartSurface)
            }
          >
            <SelectTrigger className="w-40 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastWorkspace">上次位置</SelectItem>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="routines">Routines</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow title="頁面寬度">
          <Select
            value={preferences.editorWidth}
            onValueChange={value =>
              updatePreference("editorWidth", value as EditorWidth)
            }
          >
            <SelectTrigger className="w-40 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="narrow">窄版</SelectItem>
              <SelectItem value="standard">標準</SelectItem>
              <SelectItem value="wide">寬版</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow title="文字尺寸">
          <div className="flex w-56 items-center gap-3">
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
        <SettingRow title="貼上模式">
          <Select
            value={preferences.markdownPaste}
            onValueChange={value =>
              updatePreference("markdownPaste", value as PasteBehavior)
            }
          >
            <SelectTrigger className="w-40 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="rich">保留格式</SelectItem>
              <SelectItem value="plain">純文字</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SwitchRow
          title="自動暫存"
          checked={preferences.autosaveDrafts}
          onCheckedChange={checked =>
            updatePreference("autosaveDrafts", checked)
          }
        />
        <SwitchRow
          title="自動換行"
          checked={preferences.lineWrap}
          onCheckedChange={checked => updatePreference("lineWrap", checked)}
        />
        <SwitchRow
          title="拼字檢查"
          checked={preferences.spellcheck}
          onCheckedChange={checked => updatePreference("spellcheck", checked)}
        />
        <SwitchRow
          title="快速插入列"
          checked={preferences.quickInsert}
          onCheckedChange={checked => updatePreference("quickInsert", checked)}
          hideSeparator
        />
      </Section>

      <section className="rounded-md border border-border bg-background/45 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <KeyboardIcon className="size-4 text-emerald-700" />
          編輯樣本
        </div>
        <div className="mt-4 rounded-sm border border-border bg-muted/40 p-4">
          <div
            className="font-semibold"
            style={{ fontSize: preferences.editorFontSize + 2 }}
          >
            Root Shelf / Notes
          </div>
          <div
            className="mt-3 leading-7 text-muted-foreground"
            style={{ fontSize: preferences.editorFontSize }}
          >
            Capture, link, refine. Keep the workspace quiet and durable.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Block", "Routine", "Material"].map(item => (
              <span
                key={item}
                className="rounded-sm border border-border bg-background/50 px-2 py-1 text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorTab;
