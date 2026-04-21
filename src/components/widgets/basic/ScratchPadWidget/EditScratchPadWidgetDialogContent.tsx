import { ScratchPadSetting } from "@widgets/basic/ScratchPadWidget/setting/scratchPadSetting";
import { Dispatch, SetStateAction } from "react";
import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Slider } from "@/components/ui/slider";

interface EditScratchPadWidgetDialogContentProps {
  setting: ScratchPadSetting;
  setSetting: Dispatch<SetStateAction<ScratchPadSetting>>;
}

const EditScratchPadWidgetDialogContent = ({
  setting,
  setSetting,
}: EditScratchPadWidgetDialogContentProps) => {
  return (
    <EditWidgetDialogContent title="編輯草稿本">
      <EditWidgetDialogOption
        title="草稿本內文文字大小"
        alignment="vertical"
        currentValue={setting.fontSize.toString()}
      >
        <Slider
          max={32}
          min={6}
          step={0.1}
          defaultValue={[setting.fontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, fontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditScratchPadWidgetDialogContent;
