import { useLocalPreferences } from "@shared/api/hooks/localPreferences.hook";
import { CheckIcon, InfoIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SettingRow } from "../PreferenceRows";

const AboutTab = () => {
  const { resetPreferences } = useLocalPreferences();

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <Section title="Notezy" icon={InfoIcon}>
        <SettingRow title="版本">
          <span className="text-sm font-semibold">0.1.0</span>
        </SettingRow>
        <SettingRow title="偏好儲存">
          <span className="text-sm font-semibold">Browser Local</span>
        </SettingRow>
        <SettingRow title="品牌核心">
          <div className="flex flex-wrap justify-end gap-2">
            {["Industrial", "Quiet", "Durable", "Overgrown"].map(value => (
              <span
                key={value}
                className="rounded-sm border border-border bg-muted px-2 py-1 text-xs"
              >
                {value}
              </span>
            ))}
          </div>
        </SettingRow>
        <SettingRow title="偏好重置" hideSeparator>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetPreferences}
          >
            <RotateCcwIcon className="size-4" />
            重置
          </Button>
        </SettingRow>
      </Section>

      <section className="rounded-md border border-border bg-background/45 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SparklesIcon className="size-4 text-emerald-700" />
          延後串接
        </div>
        <div className="mt-4 space-y-2">
          {[
            "跨裝置同步偏好：需要使用者設定 API",
            "遠端主題商店與收藏：需要 theme / marketplace API",
            "團隊工作區偏好套用：需要 team policy API",
            "通知規則跨裝置同步：需要 notification preference API",
          ].map(item => (
            <div
              key={item}
              className="flex gap-2 rounded-sm border border-border bg-muted/35 p-2 text-xs leading-5 text-muted-foreground"
            >
              <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutTab;
