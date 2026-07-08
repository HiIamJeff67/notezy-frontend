import { useHardDeleteMyRoutineTaskById } from "@shared/api/hooks/routineTask.hook";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface DeleteRoutineTaskDialogProps extends ModalProps {
  routineTaskId: UUID;
  routineTaskTitle: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteRoutineTaskDialog = ({
  isOpen,
  onClose,
  routineTaskId,
  routineTaskTitle,
  onDeleted,
}: DeleteRoutineTaskDialogProps) => {
  const languageManager = useLanguage();
  const deleteRoutineTaskMutator = useHardDeleteMyRoutineTaskById();

  const deleteRoutineTask = async () => {
    try {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await deleteRoutineTaskMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineTaskId,
        },
      });
      if (response.success === false) {
        toast.error(languageManager.tError(response.exception));
        return;
      }

      await onDeleted?.();
      toast.success("Routine task deleted");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !deleteRoutineTaskMutator.isPending) onClose();
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete a routine task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{routineTaskTitle}</strong>?
            This permanently removes the task.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleteRoutineTaskMutator.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteRoutineTaskMutator.isPending}
            onClick={deleteRoutineTask}
          >
            {deleteRoutineTaskMutator.isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineTaskDialog;
