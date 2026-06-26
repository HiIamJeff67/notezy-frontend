import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import React, { createContext, useEffect, useState } from "react";

export type PreferencePage =
  | "appearance"
  | "editor"
  | "focus"
  | "offline"
  | "privacy"
  | "notifications"
  | "about";

export type Density = "comfortable" | "balanced" | "compact";
export type PanelDock = "left" | "right" | "floating";
export type StartSurface = "dashboard" | "lastWorkspace" | "routines";
export type EditorWidth = "narrow" | "standard" | "wide";
export type PasteBehavior = "plain" | "rich" | "markdown";
export type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unknown";

export type LocalPreferences = {
  density: Density;
  reduceMotion: boolean;
  tactileFeedback: boolean;
  panelDock: PanelDock;
  startSurface: StartSurface;
  editorWidth: EditorWidth;
  editorFontSize: number;
  lineWrap: boolean;
  markdownPaste: PasteBehavior;
  autosaveDrafts: boolean;
  spellcheck: boolean;
  quickInsert: boolean;
  focusRail: boolean;
  ambientGrid: boolean;
  plantAccents: boolean;
  dimInactivePanels: boolean;
  localVault: boolean;
  offlineQueue: boolean;
  cacheAttachments: boolean;
  cleanupAfterDays: number;
  restoreLastWorkspace: boolean;
  privatePreviews: boolean;
  clipboardGuard: boolean;
  localDiagnostics: boolean;
  crashSnapshot: boolean;
  desktopNotifications: boolean;
  routineNudges: boolean;
  syncNotifications: boolean;
  quietMode: boolean;
  quietModeStart: string;
  quietModeEnd: string;
};

export type StorageEstimate = {
  quota: number;
  usage: number;
};

export type UpdatePreference = <Key extends keyof LocalPreferences>(
  key: Key,
  value: LocalPreferences[Key]
) => void;

export type LocalPreferencesContextValue = {
  preferences: LocalPreferences;
  updatePreference: UpdatePreference;
  resetPreferences: () => void;
  copyPreferences: () => Promise<void>;
  clipboardState: "idle" | "copied" | "failed";
  storageEstimate: StorageEstimate | null;
  storageUsagePercent: number;
  notificationPermission: NotificationPermissionState;
  requestNotificationPermission: () => Promise<void>;
  isReady: boolean;
};

export const defaultLocalPreferences: LocalPreferences = {
  density: "balanced",
  reduceMotion: false,
  tactileFeedback: true,
  panelDock: "left",
  startSurface: "lastWorkspace",
  editorWidth: "standard",
  editorFontSize: 15,
  lineWrap: true,
  markdownPaste: "markdown",
  autosaveDrafts: true,
  spellcheck: true,
  quickInsert: true,
  focusRail: true,
  ambientGrid: true,
  plantAccents: true,
  dimInactivePanels: true,
  localVault: true,
  offlineQueue: true,
  cacheAttachments: false,
  cleanupAfterDays: 30,
  restoreLastWorkspace: true,
  privatePreviews: false,
  clipboardGuard: true,
  localDiagnostics: false,
  crashSnapshot: true,
  desktopNotifications: false,
  routineNudges: true,
  syncNotifications: true,
  quietMode: true,
  quietModeStart: "22:00",
  quietModeEnd: "08:00",
};

export const LocalPreferencesContext = createContext<
  LocalPreferencesContextValue | undefined
>(undefined);

export const LocalPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [preferences, setPreferences] = useState<LocalPreferences>(
    defaultLocalPreferences
  );
  const [isReady, setIsReady] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>("unknown");
  const [storageEstimate, setStorageEstimate] =
    useState<StorageEstimate | null>(null);
  const [clipboardState, setClipboardState] = useState<
    "idle" | "copied" | "failed"
  >("idle");

  useEffect(() => {
    const saved = LocalStorageManipulator.getItemByKey(
      LocalStorageKey.localPreferences
    );

    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      setPreferences({
        ...defaultLocalPreferences,
        ...(saved as Partial<LocalPreferences>),
      });
    }

    setNotificationPermission(
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unknown"
    );
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    LocalStorageManipulator.setItem(
      LocalStorageKey.localPreferences,
      preferences
    );
  }, [isReady, preferences]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
      setStorageEstimate(null);
      return;
    }

    navigator.storage.estimate().then(estimate => {
      setStorageEstimate({
        quota: estimate.quota ?? 0,
        usage: estimate.usage ?? 0,
      });
    });
  }, []);

  const updatePreference: UpdatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultLocalPreferences);
    setClipboardState("idle");
  };

  const copyPreferences = async () => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("Clipboard is not available.");
      }
      await navigator.clipboard.writeText(JSON.stringify(preferences, null, 2));
      setClipboardState("copied");
    } catch {
      setClipboardState("failed");
    }

    window.setTimeout(() => setClipboardState("idle"), 1400);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unknown");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      updatePreference("desktopNotifications", true);
    }
  };

  const storageUsagePercent =
    storageEstimate && storageEstimate.quota > 0
      ? Math.min(
          100,
          Math.round((storageEstimate.usage / storageEstimate.quota) * 100)
        )
      : 0;

  return (
    <LocalPreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
        copyPreferences,
        clipboardState,
        storageEstimate,
        storageUsagePercent,
        notificationPermission,
        requestNotificationPermission,
        isReady,
      }}
    >
      {children}
    </LocalPreferencesContext.Provider>
  );
};
