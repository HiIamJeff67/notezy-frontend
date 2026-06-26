import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { BellIcon, MonitorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Section, SettingRow, StatusPill, SwitchRow } from "../PreferenceRows";

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
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Section
        title="通知"
        icon={BellIcon}
        footer={<StatusPill>{permissionLabel}</StatusPill>}
      >
        <SwitchRow
          title="桌面通知"
          checked={preferences.desktopNotifications}
          onCheckedChange={checked =>
            updatePreference("desktopNotifications", checked)
          }
        />
        <SwitchRow
          title="Routine 提醒"
          checked={preferences.routineNudges}
          onCheckedChange={checked =>
            updatePreference("routineNudges", checked)
          }
        />
        <SwitchRow
          title="同步通知"
          checked={preferences.syncNotifications}
          onCheckedChange={checked =>
            updatePreference("syncNotifications", checked)
          }
        />
        <SwitchRow
          title="安靜時段"
          checked={preferences.quietMode}
          onCheckedChange={checked => updatePreference("quietMode", checked)}
        />
        <SettingRow title="安靜時段範圍" hideSeparator>
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

      <section className="rounded-md border border-border bg-background/45 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MonitorIcon className="size-4 text-emerald-700" />
          權限
        </div>
        <div className="mt-4 rounded-sm border border-border bg-muted/35 p-4 text-center">
          <div className="text-2xl font-semibold">{permissionLabel}</div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={requestNotificationPermission}
            className="mt-4 w-full"
            disabled={notificationPermission === "denied"}
          >
            檢查權限
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NotificationsTab;
