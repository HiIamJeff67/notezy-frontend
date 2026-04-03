import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
  EditWidgetDialogSeparator,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ClockSetting } from "@widgets/basic/ClockWidget/data/clockSettings";
import { ClockStyles } from "@widgets/basic/ClockWidget/data/clockStyles";
import { TimeZones } from "@widgets/basic/ClockWidget/data/timeZones";
import { Dispatch, SetStateAction } from "react";

interface EditClockWidgetDialogContentProps {
  setting: ClockSetting;
  setSetting: Dispatch<SetStateAction<ClockSetting>>;
}

const EditClockWidgetDialogContent = ({
  setting,
  setSetting,
}: EditClockWidgetDialogContentProps) => {
  return (
    <EditWidgetDialogContent title="編輯時鐘">
      <EditWidgetDialogOption
        title="時區"
        description="提供多種時區，切換後將會直接改變時鐘顯示的時間"
      >
        <Select
          value={setting.selectedTimeZone.locale}
          onValueChange={newLocale =>
            setSetting(prev => ({
              ...prev,
              selectedTimeZone:
                TimeZones.find(tz => tz.locale === newLocale) ??
                prev.selectedTimeZone,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="時區" />
          </SelectTrigger>
          <SelectContent>
            {TimeZones.map(tz => (
              <SelectItem key={tz.index} value={tz.locale}>
                {tz.displayName} (UTC
                {tz.offset >= 0 ? "+" : ""}
                {tz.offset})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="時鐘款式"
        description="時鐘樣式會影響時鐘的時針、分針、秒針、以及中心圓點和外部輪廓等等"
      >
        <Select
          value={setting.selectedClockStyle.index.toString()}
          onValueChange={indexString =>
            setSetting(prev => ({
              ...prev,
              selectedClockStyle: ClockStyles[parseInt(indexString)],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="選擇款式" />
          </SelectTrigger>
          <SelectContent>
            {ClockStyles.map(clockStyle => (
              <SelectItem
                key={clockStyle.index}
                value={clockStyle.index.toString()}
              >
                {clockStyle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="顯示下方時間"
        description="開啟以透過小時、分鐘以及秒來顯示當前時間"
      >
        <Switch
          checked={setting.enableTimer}
          onCheckedChange={checked =>
            setSetting(prev => ({
              ...prev,
              enableTimer: checked,
            }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="顯示地區"
        description="開啟以顯示時區和其所在地區的名稱"
      >
        <Switch
          checked={setting.enableLocale}
          onCheckedChange={checked =>
            setSetting(prev => ({
              ...prev,
              enableLocale: checked,
            }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="下方時間文字大小"
        alignment="vertical"
        currentValue={setting.timerFontSize.toString()}
      >
        <Slider
          max={16}
          min={6}
          step={0.1}
          defaultValue={[setting.timerFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, timerFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="地區文字大小"
        alignment="vertical"
        currentValue={setting.localeFontSize.toString()}
      >
        <Slider
          max={16}
          min={6}
          step={0.1}
          defaultValue={[setting.localeFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, localeFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditClockWidgetDialogContent;
