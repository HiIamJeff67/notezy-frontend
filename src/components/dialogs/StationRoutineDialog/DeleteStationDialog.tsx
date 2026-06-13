import { useDeleteMyStationById } from "@shared/api/hooks/station.hook";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import toast from "@shared/lib/toast";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { getAuthorization } from "@shared/util/getAuthorization";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface DeleteStationDialogProps extends ModalProps {
  stationId: UUID;
  stationName: string;
  onDeleted?: () => void | Promise<void>;
}

const DeleteStationDialog = ({
  isOpen,
  onClose,
  stationId,
  stationName,
  onDeleted,
}: DeleteStationDialogProps) => {
  const languageManager = useLanguage();
  const deleteStationMutator = useDeleteMyStationById();
  const [confirmation, setConfirmation] = useState<string>("");

  useEffect(() => {
    if (!isOpen) setConfirmation("");
  }, [isOpen]);

  const deleteStation = async () => {
    if (confirmation !== stationName) return;

    try {
      const accessToken = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.accessToken
      );
      const response = await deleteStationMutator.mutateAsync({
        header: {
          userAgent: navigator.userAgent,
          authorization: getAuthorization(accessToken),
        },
        body: {
          stationId,
        },
      });
      if (response.success === false) {
        toast.error(languageManager.tError(response.exception));
        return;
      }

      await onDeleted?.();
      toast.success("Station deleted");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !deleteStationMutator.isPending) onClose();
      }}
    >
      <DialogContent className="rounded-sm bg-muted sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete a station</DialogTitle>
          <DialogDescription>
            This moves the station and its routines out of active views. Type
            the station name to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              id="delete-station-confirmation"
              value={confirmation}
              autoComplete="off"
              autoFocus
              onChange={event => setConfirmation(event.currentTarget.value)}
              aria-invalid={
                confirmation.length > 0 && confirmation !== stationName
              }
              placeholder={`Type the name of "${stationName}"`}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleteStationMutator.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                deleteStationMutator.isPending || confirmation !== stationName
              }
              onClick={deleteStation}
            >
              {deleteStationMutator.isPending && <Spinner />}
              Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStationDialog;
