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

interface DeleteRoutineTagDialogProps extends ModalProps {
  routineTagId: UUID;
  routineTagName: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteRoutineTagDialog = ({
  isOpen,
  onClose,
  routineTagId,
  routineTagName,
  onDeleted,
}: DeleteRoutineTagDialogProps) => {
  const languageManager = useLanguage();
  const routineManager = useRoutine();

  const deleteRoutineTag = async () => {
    try {
      await routineManager.hardDeleteRoutineTag(routineTagId);
      await onDeleted?.();
      toast.success("Routine tag deleted");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !routineManager.isHardDeletingRoutineTag) onClose();
      }}
    >
      <DialogContent className="rounded-sm bg-muted sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete a routine tag</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{routineTagName}</strong>?
            This permanently removes the tag and its routine links. The routines
            themselves are not deleted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={routineManager.isHardDeletingRoutineTag}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={routineManager.isHardDeletingRoutineTag}
            onClick={deleteRoutineTag}
          >
            {routineManager.isHardDeletingRoutineTag && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineTagDialog;
