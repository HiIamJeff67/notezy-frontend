import {
  EditWidgetDialogContent,
  EditWidgetDialogOption,
  EditWidgetDialogSeparator,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Slider } from "@/components/ui/slider";
import { TodoSetting } from "@widgets/basic/TodoWidget/data/todoSettings";
import { Dispatch, SetStateAction } from "react";

interface EditTodoWidgetDialogContentProps {
  setting: TodoSetting;
  setSetting: Dispatch<SetStateAction<TodoSetting>>;
}

const EditTodoWidgetDialogContent = ({
  setting,
  setSetting,
}: EditTodoWidgetDialogContentProps) => {
  return (
    <EditWidgetDialogContent title="編輯待辦清單">
      <EditWidgetDialogOption
        title="標題文字大小"
        alignment="vertical"
        currentValue={setting.titleFontSize.toString()}
      >
        <Slider
          max={28}
          min={6}
          step={0.1}
          defaultValue={[setting.titleFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, titleFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="項目文字大小"
        alignment="vertical"
        currentValue={setting.itemFontSize.toString()}
      >
        <Slider
          max={24}
          min={6}
          step={0.1}
          defaultValue={[setting.itemFontSize]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, itemFontSize: value[0] }))
          }
        />
      </EditWidgetDialogOption>
      <EditWidgetDialogSeparator />
      <EditWidgetDialogOption
        title="項目高度"
        alignment="vertical"
        currentValue={setting.itemHeight.toString()}
      >
        <Slider
          max={36}
          min={26}
          step={0.1}
          defaultValue={[setting.itemHeight]}
          onValueChange={value =>
            setSetting(prev => ({ ...prev, itemHeight: value[0] }))
          }
        />
      </EditWidgetDialogOption>
    </EditWidgetDialogContent>
  );
};

export default EditTodoWidgetDialogContent;
