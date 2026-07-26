import { WebURLPathDictionary } from "@shared/constants";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { Maximize2Icon, PanelRightOpenIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Article,
  ArticleContent,
  type ArticleNavigationItem,
  ArticleNavigationSidebar,
  ArticleParagraph,
  ArticleParagraphContent,
  ArticleParagraphHeader,
  ArticleParagraphSeparator,
} from "@/components/commons/Article/Article";
import AboutTab from "@/components/panels/PreferencesPanel/tabs/AboutTab";
import BrowserPermissionsTab from "@/components/panels/PreferencesPanel/tabs/BrowserPermissionsTab";
import NotificationsTab from "@/components/panels/PreferencesPanel/tabs/NotificationsTab";
import PrivacyTab from "@/components/panels/PreferencesPanel/tabs/PrivacyTab";
import { Button } from "@/components/ui/button";
import { useAppRouterActions, useSettingsDisplay } from "@/hooks";
import { useLocalPreferences } from "@/hooks/localPreferences";
import {
  AppearanceSettings,
  EditorSettings,
  OfflineSettings,
} from "./PreferencesPageContent";

const navigationItems = [
  {
    id: "appearance",
    title: "外觀",
    description: "調整主題、語言、密度與畫面互動回饋。",
    weight: 5,
  },
  {
    id: "editor",
    title: "編輯器",
    description: "設定閱讀寬度、字級與編輯時出現的工具。",
    weight: 4,
  },
  {
    id: "offline",
    title: "離線資料",
    description: "管理本機快取、Yjs 文件與瀏覽器儲存空間。",
    weight: 3,
  },
  {
    id: "privacy",
    title: "隱私",
    description: "控制起始畫面、預覽資訊與本機剪貼簿保護。",
    weight: 2,
  },
  {
    id: "browser-permissions",
    title: "瀏覽器權限",
    description: "查看並重新授權此瀏覽器提供的能力。",
    weight: 3,
  },
  {
    id: "notifications",
    title: "通知",
    description: "決定桌面、同步與 routine 提醒的傳送方式。",
    weight: 3,
  },
  {
    id: "about",
    title: "關於",
    description: "查看版本資訊、匯出本機偏好或重設設定。",
    weight: 2,
  },
] satisfies ArticleNavigationItem[];

const PreferencesPage = ({
  displayMode = "page",
}: {
  displayMode?: "page" | "sheet";
}) => {
  const { isReady } = useLocalPreferences();
  const router = useAppRouterActions();
  const { openSheet, closeSheet } = useSettingsDisplay();

  return (
    <div
      className={`relative h-full min-h-0 bg-canvas py-6 ${
        displayMode === "sheet" ? "px-2" : "px-4 sm:px-6 lg:px-3"
      }`}
    >
      <Button
        data-density-static
        type="button"
        variant="default"
        size="icon"
        className="absolute top-3 left-4 z-20 size-7 p-0 select-none bg-transparent text-foreground hover:bg-primary sm:left-6"
        aria-label={
          displayMode === "sheet"
            ? "Open settings as a page"
            : "Open settings in sheet"
        }
        title={displayMode === "sheet" ? "Open as page" : "Open in sheet"}
        onClick={() => {
          LocalStorageManipulator.setItem(
            LocalStorageKey.settingsDisplayMode,
            displayMode === "sheet" ? "page" : "sheet"
          );

          if (displayMode === "sheet") {
            closeSheet();
            router.push(WebURLPathDictionary.root.setting.preferences);
            return;
          }

          openSheet("preferences");
          router.push(WebURLPathDictionary.root.dashboard._);
        }}
      >
        {displayMode === "sheet" ? <Maximize2Icon /> : <PanelRightOpenIcon />}
      </Button>
      <Article className={displayMode === "sheet" ? "lg:gap-0" : undefined}>
        <ArticleNavigationSidebar
          items={navigationItems}
          paragraphBaseHeight={12}
          subParagraphBaseHeight={6}
          className={
            displayMode === "sheet" ? "hidden lg:block lg:w-16" : undefined
          }
        />
        <ArticleContent
          className={
            displayMode === "sheet"
              ? "px-4 pt-12 sm:px-6 lg:pl-0 lg:pr-14"
              : undefined
          }
        >
          <PreferenceTab
            id="appearance"
            title="外觀"
            description="調整主題、語言、密度與畫面互動回饋。"
            primary
          >
            {isReady && <AppearanceSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="editor"
            title="編輯器"
            description="設定閱讀寬度、字級與編輯時出現的工具。"
          >
            {isReady && <EditorSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="offline"
            title="離線資料"
            description="管理本機快取、Yjs 文件與瀏覽器儲存空間。"
          >
            {isReady && <OfflineSettings />}
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="privacy"
            title="隱私"
            description="控制起始畫面、預覽資訊與本機剪貼簿保護。"
          >
            <PrivacyTab />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="browser-permissions"
            title="瀏覽器權限"
            description="查看並重新授權此瀏覽器提供的能力。"
          >
            <BrowserPermissionsTab />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="notifications"
            title="通知"
            description="決定桌面、同步與 routine 提醒的傳送方式。"
          >
            <NotificationsTab />
          </PreferenceTab>

          <ArticleParagraphSeparator />

          <PreferenceTab
            id="about"
            title="關於"
            description="查看版本資訊、匯出本機偏好或重設設定。"
          >
            <AboutTab />
          </PreferenceTab>
        </ArticleContent>
      </Article>
    </div>
  );
};

const PreferenceTab = ({
  id,
  title,
  description,
  children,
  primary = false,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  primary?: boolean;
}) => (
  <ArticleParagraph id={id}>
    <ArticleParagraphHeader>
      {primary && (
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Preference settings
        </p>
      )}
      {primary ? (
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      ) : (
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      )}
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </ArticleParagraphHeader>
    <ArticleParagraphContent className="max-w-none text-foreground">
      {children}
    </ArticleParagraphContent>
  </ArticleParagraph>
);

export default PreferencesPage;
