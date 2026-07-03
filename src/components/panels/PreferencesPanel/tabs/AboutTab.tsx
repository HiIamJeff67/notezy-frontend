import { useLocalPreferences } from "@/hooks/localPreferences";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SettingRow } from "../PreferenceRows";

const AboutTab = () => {
  const { resetPreferences } = useLocalPreferences();

  return (
    <div className="max-w-2xl">
      <Section>
        <SettingRow title="版本" description="目前安裝的 Notezy 前端版本。">
          <span className="text-sm font-semibold">0.1.0</span>
        </SettingRow>
        <SettingRow
          title="偏好重置"
          description="把這個面板中的本機偏好恢復為預設值。"
          hideSeparator
        >
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
    </div>
  );
};

export default AboutTab;
