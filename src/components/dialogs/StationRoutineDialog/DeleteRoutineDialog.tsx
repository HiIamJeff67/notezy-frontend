import toast from "@shared/lib/toast";
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
import { useLanguage, useRoutine } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface DeleteRoutineDialogProps extends ModalProps {
  routineId: UUID;
  routineTitle: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteRoutineDialog = ({
  isOpen,
  onClose,
  routineId,
  routineTitle,
  onDeleted,
}: DeleteRoutineDialogProps) => {
  const languageManager = useLanguage();
  const routineManager = useRoutine();

  const deleteRoutine = async () => {
    try {
      await routineManager.deleteRoutine(routineId);
      await onDeleted?.();
      toast.success("Routine deleted");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !routineManager.isDeletingRoutine) onClose();
      }}
    >
      <DialogContent className="rounded-sm bg-muted sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete a routine</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{routineTitle}</strong>?
            This removes the routine from active schedules.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={routineManager.isDeletingRoutine}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={routineManager.isDeletingRoutine}
            onClick={deleteRoutine}
          >
            {routineManager.isDeletingRoutine && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineDialog;
