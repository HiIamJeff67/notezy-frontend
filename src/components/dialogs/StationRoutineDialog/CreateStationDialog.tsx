import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import SupportedIconTable from "@/components/commons/SupportedIconTable/SupportedIconTable";
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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage, useStationRoutine } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface CreateStationDialogProps extends ModalProps {
  onCreated?: (stationId: UUID) => void | Promise<void>;
}

const CreateStationDialog = ({
  isOpen,
  onClose,
  onCreated,
}: CreateStationDialogProps) => {
  const languageManager = useLanguage();
  const stationRoutineManager = useStationRoutine();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<SupportedIcon | null>(null);
  const [headerBackgroundURL, setHeaderBackgroundURL] = useState<string>("");

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setDescription("");
    setIcon(null);
    setHeaderBackgroundURL("");
  }, [isOpen]);

  const createStation = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedHeaderBackgroundURL = headerBackgroundURL.trim();
    if (trimmedName.length === 0) return;

    try {
      const stationNode = await stationRoutineManager.createStation(
        trimmedName,
        trimmedDescription,
        icon,
        trimmedHeaderBackgroundURL.length === 0
          ? null
          : trimmedHeaderBackgroundURL
      );
      await onCreated?.(stationNode.id);
      toast.success("Station created");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !stationRoutineManager.isCreatingStation) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-visible rounded-sm bg-muted sm:max-w-xl [&_[data-slot=select-trigger]]:focus-visible:ring-1 [&_[data-slot=select-trigger]]:focus-visible:ring-inset [&_[data-slot=select-trigger]]:focus-visible:ring-offset-0 [&_button]:focus-visible:ring-inset [&_button]:focus-visible:ring-offset-0 [&_input]:focus-visible:ring-1 [&_input]:focus-visible:ring-inset [&_input]:focus-visible:ring-offset-0 [&_textarea]:focus-visible:ring-1 [&_textarea]:focus-visible:ring-inset [&_textarea]:focus-visible:ring-offset-0">
        <DialogHeader>
          <DialogTitle>Create station</DialogTitle>
          <DialogDescription>
            Create a workspace for routines, tasks, and scheduling.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            await createStation();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="station-name">Name</Label>
            <Input
              id="station-name"
              value={name}
              autoComplete="off"
              maxLength={128}
              autoFocus
              onChange={event => setName(event.currentTarget.value)}
              placeholder="What do you want to handle or manage in this station?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="station-description">Description (Optional)</Label>
            <Textarea
              id="station-description"
              value={description}
              maxLength={1024}
              onChange={event => setDescription(event.currentTarget.value)}
              placeholder="Describe the detail about this station"
              className="min-h-24 resize-none"
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0">
              <Label>Icon</Label>
              <SupportedIconTable
                value={icon}
                onValueChange={setIcon}
                disabled={stationRoutineManager.isCreatingStation}
                className="bg-muted"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Label htmlFor="station-background-url">Background URL</Label>
              <Input
                id="station-background-url"
                type="url"
                value={headerBackgroundURL}
                autoComplete="off"
                onChange={event =>
                  setHeaderBackgroundURL(event.currentTarget.value)
                }
                placeholder="https://"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={stationRoutineManager.isCreatingStation}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                stationRoutineManager.isCreatingStation ||
                name.trim().length === 0
              }
            >
              {stationRoutineManager.isCreatingStation && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStationDialog;
