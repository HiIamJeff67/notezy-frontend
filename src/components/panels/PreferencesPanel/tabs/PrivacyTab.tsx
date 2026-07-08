import { useLocalPreferences } from "@/hooks/localPreferences";
import { EyeOffIcon } from "lucide-react";
import { Section, SwitchRow } from "../PreferenceRows";

const PrivacyTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
      <Section>
        <SwitchRow
          title="還原上次工作區"
          description="下次開啟時回到最後使用的位置，減少重新找資料的時間。"
          checked={preferences.restoreLastWorkspace}
          onCheckedChange={checked =>
            updatePreference("restoreLastWorkspace", checked)
          }
        />
        <SwitchRow
          title="隱藏預覽標題"
          description="在切換器或預覽區降低筆記標題可見度，適合共用螢幕時使用。"
          checked={preferences.privatePreviews}
          onCheckedChange={checked =>
            updatePreference("privatePreviews", checked)
          }
        />
        <SwitchRow
          title="剪貼簿防護"
          description="複製敏感內容時加入本機提醒，避免誤貼到其他應用程式。"
          checked={preferences.clipboardGuard}
          onCheckedChange={checked =>
            updatePreference("clipboardGuard", checked)
          }
        />
        <SwitchRow
          title="本機診斷"
          description="保留基本客戶端診斷資訊，協助排查畫面或本機資料問題。"
          checked={preferences.localDiagnostics}
          onCheckedChange={checked =>
            updatePreference("localDiagnostics", checked)
          }
        />
        <SwitchRow
          title="崩潰快照"
          description="發生錯誤時保留最後的本機狀態摘要，方便之後回報與復原。"
          checked={preferences.crashSnapshot}
          onCheckedChange={checked =>
            updatePreference("crashSnapshot", checked)
          }
          hideSeparator
        />
      </Section>

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <EyeOffIcon className="size-4 text-primary" />
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
