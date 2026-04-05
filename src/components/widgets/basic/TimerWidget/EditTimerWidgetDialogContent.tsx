import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
  EditWidgetDialogSeparator,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dispatch, SetStateAction } from "react";
import { TimerSetting } from "./data/timerSettings";

interface EditTimerWidgetDialogContentProps {
  setting: TimerSetting;
  setSetting: Dispatch<SetStateAction<TimerSetting>>;
}

const EditTimerWidgetDialogContent = ({
  setting,
  setSetting,
}: EditTimerWidgetDialogContentProps) => {
  return (
    <EditWidgetDialogContent title="編輯計時器">
      <EditWidgetDialogOption
        title="計時器文字大小"
        alignment="vertical"
        currentValue={setting.counterFontSize.toString()}
      >
        <Slider
          max={64}
          min={16}
          step={0.1}
          defaultValue={[setting.counterFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, counterFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="按鈕文字大小"
        alignment="vertical"
        currentValue={setting.buttonSize.toString()}
      >
        <Slider
          max={24}
          min={8}
          step={0.1}
          defaultValue={[setting.buttonSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, buttonSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="安靜模式"
        description="開啟安靜模式已關閉介面多餘按鈕，包含：開始或中斷按鈕、暫停按鈕、查看歷史紀錄按鈕等等"
      >
        <Switch
          checked={setting.isSilence}
          onCheckedChange={checked =>
            setSetting(prev => ({
              ...prev,
              isSilence: checked,
            }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditTimerWidgetDialogContent;
