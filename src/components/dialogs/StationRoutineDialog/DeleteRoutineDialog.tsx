import { useDeleteMyRoutineById } from "@shared/api/hooks/routine.hook";
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
  const deleteRoutineMutator = useDeleteMyRoutineById();

  const deleteRoutine = async () => {
    try {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await deleteRoutineMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineId,
        },
      });
      if (response.success === false) {
        toast.error(languageManager.tError(response.exception));
        return;
      }

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
        if (!open && !deleteRoutineMutator.isPending) onClose();
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
            disabled={deleteRoutineMutator.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteRoutineMutator.isPending}
            onClick={deleteRoutine}
          >
            {deleteRoutineMutator.isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineDialog;
