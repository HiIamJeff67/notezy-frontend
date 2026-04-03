import { DeferredSuspense } from "@/components/commons/DeferredSuspense/DeferredSuspense";
import {
  EditWidgetDialog,
  EditWidgetDialogContentSkeleton,
} from "@/components/dialogs/WidgetDialog/EditWidgetDialog";
import { TodoSetting } from "@widgets/basic/TodoWidget/data/todoSettings";
import { Dispatch, lazy, SetStateAction } from "react";

const EditTodoWidgetDialogContent = lazy(
  () => import("./EditTodoWidgetDialogContent")
);

interface EditTodoWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: TodoSetting;
  setSetting: Dispatch<SetStateAction<TodoSetting>>;
}

const EditTodoWidgetDialog = ({
  open,
  onOpenChange,
  setting,
  setSetting,
}: EditTodoWidgetDialogProps) => {
  return (
    <EditWidgetDialog open={open} onOpenChange={onOpenChange}>
      <DeferredSuspense
        trigger={open}
        fallback={
          <EditWidgetDialogContentSkeleton title="編輯時鐘" count={2} />
        }
        fallbackDelayMs={100}
      >
        <EditTodoWidgetDialogContent
          setting={setting}
          setSetting={setSetting}
        />
      </DeferredSuspense>
    </EditWidgetDialog>
  );
};

export default EditTodoWidgetDialog;
