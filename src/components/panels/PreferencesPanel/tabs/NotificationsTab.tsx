import { useLocalPreferences } from "@/hooks/localPreferences";
import TimePicker from "@/components/commons/TimePicker/TimePicker";
import { Section, SettingRow, SwitchRow } from "../PreferenceRows";

const timeStringToDate = (time: string) => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return new Date(2000, 0, 1, Number(hours), Number(minutes), 0, 0);
};

const dateToTimeString = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

const NotificationsTab = () => {
  const { preferences, updatePreference } = useLocalPreferences();

  return (
    <div>
      <Section>
        <SwitchRow
          title="桌面通知"
          description="允許 Notezy 使用瀏覽器桌面通知提醒你本機事件與工作狀態。"
          checked={preferences.desktopNotifications}
          unsupportedReason="尚未支援"
          onCheckedChange={checked =>
            updatePreference("desktopNotifications", checked)
          }
        />
        <SwitchRow
          title="Routine 提醒"
          description="在 routine 接近時間時發出提醒，避免正在工作的流程被遺漏。"
          checked={preferences.routineNudges}
          unsupportedReason="尚未支援"
          onCheckedChange={checked =>
            updatePreference("routineNudges", checked)
          }
        />
        <SwitchRow
          title="同步通知"
          description="同步完成、暫停或失敗時顯示提示，讓本機資料狀態更明確。"
          checked={preferences.syncNotifications}
          onCheckedChange={checked =>
            updatePreference("syncNotifications", checked)
          }
        />
        <SwitchRow
          title="安靜時段"
          description="在指定時間降低通知干擾，只保留必要的系統狀態。"
          checked={preferences.quietMode}
          onCheckedChange={checked => updatePreference("quietMode", checked)}
        />
        <SettingRow
          title="安靜時段範圍"
          description="設定每天暫停一般提醒的開始與結束時間。"
          hideSeparator
        >
          <div className="flex items-center gap-2">
            <TimePicker
              value={timeStringToDate(preferences.quietModeStart)}
              onValueChange={value => {
                if (!value) return;
                updatePreference("quietModeStart", dateToTimeString(value));
              }}
              disabled={!preferences.quietMode}
              placeholder="開始時間"
              className="w-32"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <TimePicker
              value={timeStringToDate(preferences.quietModeEnd)}
              onValueChange={value => {
                if (!value) return;
                updatePreference("quietModeEnd", dateToTimeString(value));
              }}
              disabled={!preferences.quietMode}
              placeholder="結束時間"
              className="w-32"
            />
          </div>
        </SettingRow>
      </Section>
    </div>
  );
};

export default NotificationsTab;
