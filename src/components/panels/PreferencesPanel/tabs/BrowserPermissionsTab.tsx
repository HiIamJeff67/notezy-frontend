import { RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Section } from "../PreferenceRows";

type PermissionDisplayState =
  | PermissionState
  | "unsupported"
  | "unavailable"
  | "checking";

type PermissionItem = {
  name: PermissionName;
  label: string;
  description: string;
  requestLabel?: string;
  request?: () => Promise<PermissionDisplayState | void>;
};

const permissionItems: PermissionItem[] = [
  {
    name: "notifications" as PermissionName,
    label: "Notifications",
    description: "用於桌面通知與未來重要狀態提醒。",
    requestLabel: "要求授權",
    request: async () => {
      if (typeof Notification !== "undefined") {
        await Notification.requestPermission();
      }
    },
  },
  {
    name: "clipboard-read" as PermissionName,
    label: "Clipboard Read",
    description: "用於需要讀取剪貼簿內容的匯入流程。",
  },
  {
    name: "clipboard-write" as PermissionName,
    label: "Clipboard Write",
    description: "用於複製偏好、識別碼或產生的內容。",
  },
  {
    name: "persistent-storage" as PermissionName,
    label: "Persistent Storage",
    description:
      "請求瀏覽器保留 Notezy 的本機資料；是否核准由瀏覽器決定，通常不會跳出確認視窗。",
    requestLabel: "請求保留",
    request: async () => {
      if (!navigator.storage?.persist) return "unavailable";
      return (await navigator.storage.persist()) ? "granted" : "prompt";
    },
  },
  {
    name: "geolocation" as PermissionName,
    label: "Geolocation",
    description: "保留給需要位置脈絡的工作區功能。",
    requestLabel: "要求授權",
    request: async () => {
      if (!navigator.geolocation) return;
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(),
          error => reject(error),
          { maximumAge: 60_000, timeout: 10_000 }
        );
      }).catch(() => undefined);
    },
  },
];

const stateLabel: Record<PermissionDisplayState, string> = {
  granted: "已允許",
  prompt: "待詢問",
  denied: "已封鎖",
  unsupported: "不支援",
  unavailable: "不可用",
  checking: "檢查中",
};

const queryPermission = async (
  name: PermissionName
): Promise<PermissionDisplayState> => {
  if (name === "notifications" && typeof Notification !== "undefined") {
    return Notification.permission === "default"
      ? "prompt"
      : Notification.permission;
  }

  if (name === ("persistent-storage" as PermissionName)) {
    if (typeof navigator === "undefined" || !navigator.storage?.persisted) {
      return "unavailable";
    }
    if (await navigator.storage.persisted()) return "granted";
  }

  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unavailable";
  }

  try {
    const status = await navigator.permissions.query({ name });
    return status.state;
  } catch {
    return "unsupported";
  }
};

const BrowserPermissionsTab = () => {
  const [states, setStates] = useState<
    Record<PermissionName, PermissionDisplayState>
  >(
    () =>
      Object.fromEntries(
        permissionItems.map(item => [item.name, "checking"])
      ) as Record<PermissionName, PermissionDisplayState>
  );
  const [pendingPermission, setPendingPermission] =
    useState<PermissionName | null>(null);
  const [actionMessages, setActionMessages] = useState<
    Partial<Record<PermissionName, string>>
  >({});

  const refreshPermissions = useCallback(async (clearMessages = true) => {
    setStates(
      Object.fromEntries(
        permissionItems.map(item => [item.name, "checking"])
      ) as Record<PermissionName, PermissionDisplayState>
    );
    if (clearMessages) setActionMessages({});
    const entries = await Promise.all(
      permissionItems.map(
        async item => [item.name, await queryPermission(item.name)] as const
      )
    );
    setStates(
      Object.fromEntries(entries) as Record<
        PermissionName,
        PermissionDisplayState
      >
    );
  }, []);

  const requestPermission = async (item: PermissionItem) => {
    if (!item.request) return;

    setPendingPermission(item.name);
    try {
      const requestedState = await item.request();
      await refreshPermissions(false);
      if (
        requestedState &&
        item.name === ("persistent-storage" as PermissionName)
      ) {
        setActionMessages(current => ({
          ...current,
          [item.name]:
            requestedState === "granted"
              ? "已啟用持久儲存"
              : "瀏覽器未核准持久儲存；部分瀏覽器會依使用情況自動判斷，不會顯示確認視窗。",
        }));
      }
    } finally {
      setPendingPermission(null);
    }
  };

  useEffect(() => {
    void refreshPermissions();
  }, [refreshPermissions]);

  return (
    <div>
      <Section>
        <div className="border-b border-border/50 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium">網站權限狀態</div>
              <div className="mt-1 text-sm leading-5 text-muted-foreground">
                這裡只顯示 Notezy 目前較相關、且瀏覽器允許查詢的權限。
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refreshPermissions()}
            >
              <RefreshCwIcon className="size-4" />
              重新檢查
            </Button>
          </div>
        </div>

        <div>
          {permissionItems.map((item, index) => (
            <div
              key={item.name}
              className={`flex min-h-[calc(var(--density-control-height)+1.75rem)] items-center justify-between gap-[var(--density-content-gap)] py-[calc(var(--density-content-padding)*0.75)] ${
                index !== permissionItems.length - 1
                  ? "border-b border-border/50"
                  : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="mt-1 text-sm leading-5 text-muted-foreground">
                  {item.description}
                </div>
                {actionMessages[item.name] && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {actionMessages[item.name]}
                  </div>
                )}
              </div>
              <span className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {stateLabel[states[item.name] ?? "checking"]}
              </span>
              {states[item.name] === "granted" ? (
                <Button type="button" variant="outline" size="sm" disabled>
                  於瀏覽器取消
                </Button>
              ) : states[item.name] === "prompt" && item.request ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pendingPermission === item.name}
                  onClick={() => void requestPermission(item)}
                >
                  {pendingPermission === item.name
                    ? "請求中"
                    : (item.requestLabel ?? "要求授權")}
                </Button>
              ) : states[item.name] === "denied" ? (
                <Button type="button" variant="outline" size="sm" disabled>
                  已封鎖
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" disabled>
                  瀏覽器控制
                </Button>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default BrowserPermissionsTab;
