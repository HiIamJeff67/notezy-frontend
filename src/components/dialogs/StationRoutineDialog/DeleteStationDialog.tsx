import toast from "@shared/lib/toast";
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
import { Spinner } from "@/components/ui/spinner";
import { useLanguage, useStationRoutine } from "@/hooks";
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
  const stationRoutineManager = useStationRoutine();
  const [confirmation, setConfirmation] = useState<string>("");

  useEffect(() => {
    if (!isOpen) setConfirmation("");
  }, [isOpen]);

  const deleteStation = async () => {
    if (confirmation !== stationName) return;

    try {
      await stationRoutineManager.deleteStation(stationId);
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
        if (!open && !stationRoutineManager.isDeletingStation) onClose();
      }}
    >
      <DialogContent className="rounded-sm bg-muted sm:max-w-md [&_[data-slot=select-trigger]]:border-border [&_[data-slot=select-trigger]]:bg-card/45 [&_[data-slot=select-trigger]]:hover:bg-card/60 [&_[data-slot=select-trigger]]:focus-visible:bg-card/60 [&_[data-slot=select-trigger]]:focus-visible:ring-1 [&_[data-slot=select-trigger]]:focus-visible:ring-inset [&_[data-slot=select-trigger]]:focus-visible:ring-offset-0 [&_button]:focus-visible:ring-inset [&_button]:focus-visible:ring-offset-0 [&_input]:border-border [&_input]:bg-card/45 [&_input]:hover:bg-card/60 [&_input]:focus-visible:bg-card/60 [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-inset [&_input]:focus-visible:ring-offset-0 [&_textarea]:border-border [&_textarea]:bg-card/45 [&_textarea]:hover:bg-card/60 [&_textarea]:focus-visible:bg-card/60 [&_textarea]:focus-visible:ring-1 [&_textarea]:focus-visible:ring-inset [&_textarea]:focus-visible:ring-offset-0">
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
              disabled={stationRoutineManager.isDeletingStation}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                stationRoutineManager.isDeletingStation ||
                confirmation !== stationName
              }
              onClick={deleteStation}
            >
              {stationRoutineManager.isDeletingStation && <Spinner />}
              Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStationDialog;
