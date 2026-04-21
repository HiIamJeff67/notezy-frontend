import { TimerSetting } from "@widgets/basic/TimerWidget/setting/timerSetting";
import { Dispatch, lazy, SetStateAction } from "react";
import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";

const EditTimerWidgetDialogContent = lazy(
  () => import("./EditTimerWidgetDialogContent")
);

interface EditTimerWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: TimerSetting;
  setSetting: Dispatch<SetStateAction<TimerSetting>>;
}

const EditTimerWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditTimerWidgetDialogProps) => {
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton title="編輯計時器" count={2} />
        }
        fallbackDelayMs={100}
      >
        <EditTimerWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditTimerWidgetDialog;
