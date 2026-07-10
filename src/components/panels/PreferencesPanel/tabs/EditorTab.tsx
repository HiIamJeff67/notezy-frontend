import type { EditorWidth } from "@/hooks/localPreferences";
import { useLocalPreferences } from "@/hooks/localPreferences";
import { KeyboardIcon } from "lucide-react";
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
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
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
        <div className="border-b border-border/50 py-[calc(var(--density-content-padding)*0.75)]">
          <div className="text-sm font-medium">文字尺寸</div>
          <div className="mt-1 text-sm leading-5 text-muted-foreground">
            設定編輯器中的基準字級，只影響本機顯示偏好。
          </div>
          <div className="mt-3 flex items-center gap-3">
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
        </div>
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

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <KeyboardIcon className="size-4 text-primary" />
          編輯樣本
        </div>
        <div
          className="mt-4 space-y-3 rounded-sm border border-border bg-muted/40 p-3"
          style={{ fontSize: preferences.editorFontSize }}
        >
          <div className="rounded-sm border border-border bg-card p-3">
            <div className="grid grid-cols-[22px_1fr] gap-2">
              <div className="flex items-start justify-center pt-1 text-muted-foreground">
                {preferences.quickInsert && (
                  <span className="text-sm leading-none">+</span>
                )}
              </div>
              <div>
                <div
                  className="font-semibold leading-tight"
                  style={{ fontSize: preferences.editorFontSize + 5 }}
                >
                  Planning notes
                </div>
                <div className="mt-2 leading-6 text-muted-foreground">
                  Capture, link, refine. Keep the workspace quiet and durable.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            {[
              ["Inbox review", "bullet"],
              ["Sync routine blocks", "check"],
            ].map(([text, type]) => (
              <div
                key={text}
                className="grid grid-cols-[22px_1fr] gap-2 py-1.5"
              >
                <div className="flex items-center justify-center">
                  {preferences.blockDragHandle && (
                    <span className="grid grid-cols-2 gap-0.5">
                      {[0, 1, 2, 3, 4, 5].map(dot => (
                        <span
                          key={dot}
                          className="size-1 rounded-full bg-muted-foreground/45"
                        />
                      ))}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`grid size-4 shrink-0 place-items-center ${
                      type === "check"
                        ? "rounded-sm border border-primary text-[10px] text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {type === "check" ? "✓" : "•"}
                  </span>
                  <span>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditorTab;
