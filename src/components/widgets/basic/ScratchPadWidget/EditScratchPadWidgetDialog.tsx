import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { Dispatch, lazy, SetStateAction } from "react";
import { ScratchPadSetting } from "./data/scratchPadSettings";

const EditScratchPadWidgetDialogContent = lazy(
  () => import("./EditScratchPadWidgetDialogContent")
);

interface EditScratchPadWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: ScratchPadSetting;
  setSetting: Dispatch<SetStateAction<ScratchPadSetting>>;
}

const EditScratchPadWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditScratchPadWidgetDialogProps) => {
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton title="編輯草稿本" count={1} />
        }
        fallbackDelayMs={100}
      >
        <EditScratchPadWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditScratchPadWidgetDialog;
