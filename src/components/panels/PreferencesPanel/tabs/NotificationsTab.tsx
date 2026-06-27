import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { MonitorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section, SettingRow, SwitchRow } from "../PreferenceRows";

const NotificationsTab = () => {
  const {
    notificationPermission,
    preferences,
    requestNotificationPermission,
    updatePreference,
  } = useLocalPreferences();

  const permissionLabel =
    notificationPermission === "granted"
      ? "已允許"
      : notificationPermission === "denied"
        ? "已封鎖"
        : notificationPermission === "default"
          ? "尚未決定"
          : "不支援";

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_300px]">
      <Section>
        <SwitchRow
          title="桌面通知"
          description="允許 Notezy 使用瀏覽器桌面通知提醒你本機事件與工作狀態。"
          checked={preferences.desktopNotifications}
          onCheckedChange={checked =>
            updatePreference("desktopNotifications", checked)
          }
        />
        <SwitchRow
          title="Routine 提醒"
          description="在 routine 接近時間時發出提醒，避免正在工作的流程被遺漏。"
          checked={preferences.routineNudges}
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
          title="瀏覽器權限"
          description="向瀏覽器確認桌面通知權限；如果已被封鎖，需要到瀏覽器設定解除。"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={requestNotificationPermission}
            disabled={notificationPermission === "denied"}
          >
            檢查權限
          </Button>
        </SettingRow>
        <SettingRow
          title="安靜時段範圍"
          description="設定每天暫停一般提醒的開始與結束時間。"
          hideSeparator
        >
          <div className="flex items-center gap-2">
            <Select
              value={preferences.quietModeStart}
              onValueChange={value => updatePreference("quietModeStart", value)}
            >
              <SelectTrigger className="w-24 bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["20:00", "21:00", "22:00", "23:00"].map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">to</span>
            <Select
              value={preferences.quietModeEnd}
              onValueChange={value => updatePreference("quietModeEnd", value)}
            >
              <SelectTrigger className="w-24 bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["06:00", "07:00", "08:00", "09:00"].map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SettingRow>
      </Section>

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MonitorIcon className="size-4 text-emerald-700" />
          權限
        </div>
        <div className="mt-4 rounded-sm border border-border bg-muted/35 p-4 text-center">
          <div className="text-2xl font-semibold">{permissionLabel}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Browser notification permission
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotificationsTab;
