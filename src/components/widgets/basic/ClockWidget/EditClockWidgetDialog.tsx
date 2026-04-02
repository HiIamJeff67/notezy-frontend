import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Dispatch, lazy, SetStateAction } from "react";
import { Setting } from "./data/clockSettings";
import EditClockWidgetDialogContentSkeleton from "./EditClockWidgetDialogContentSkeleton";

const EditClockWidgetDialogContent = lazy(
  () => import("./EditClockWidgetDialogContent")
);

interface EditClockWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: Setting;
  setSetting: Dispatch<SetStateAction<Setting>>;
}

const EditClockWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditClockWidgetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-muted border-1 border-border">
        <DeferredSuspense
          trigger={open}
          fallback={<EditClockWidgetDialogContentSkeleton />}
          fallbackDelayMs={200}
        >
          <EditClockWidgetDialogContent
            setting={setting}
            setSetting={setSetting}
          />
        </DeferredSuspense>
      </DialogContent>
    </Dialog>
  );
};

export default EditClockWidgetDialog;
