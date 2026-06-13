import { useHardDeleteMyRoutineTagById } from "@shared/api/hooks/routineTag.hook";
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
  const deleteRoutineTagMutator = useHardDeleteMyRoutineTagById();

  const deleteRoutineTag = async () => {
    try {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await deleteRoutineTagMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          routineTagId,
        },
      });
      if (response.success === false) {
        toast.error(languageManager.tError(response.exception));
        return;
      }

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
        if (!open && !deleteRoutineTagMutator.isPending) onClose();
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
            disabled={deleteRoutineTagMutator.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteRoutineTagMutator.isPending}
            onClick={deleteRoutineTag}
          >
            {deleteRoutineTagMutator.isPending && <Spinner />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoutineTagDialog;
