import type { SupportedIcon } from "@shared/api/interfaces/enums";
import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useEffect, useState } from "react";
import ColorSelector from "@/components/commons/ColorSelector/ColorSelector";
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
import { useLanguage, useRoutine } from "@/hooks";
import type { ModalProps } from "@/providers/ModalProvider";

interface CreateRoutineTagDialogProps extends ModalProps {
  onCreated?: (routineTagId: UUID) => void | Promise<void>;
}

const CreateRoutineTagDialog = ({
  isOpen,
  onClose,
  onCreated,
}: CreateRoutineTagDialogProps) => {
  const languageManager = useLanguage();
  const routineManager = useRoutine();

  const [name, setName] = useState<string>("");
  const [color, setColor] = useState<string>("#6b7280");
  const [icon, setIcon] = useState<SupportedIcon | null>(null);

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setColor("#6b7280");
    setIcon(null);
  }, [isOpen]);

  const createRoutineTag = async () => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;

    try {
      const routineTagNode = await routineManager.createRoutineTag(
        trimmedName,
        color,
        icon
      );
      await onCreated?.(routineTagNode.id);
      toast.success("Routine tag created");
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open && !routineManager.isCreatingRoutineTag) onClose();
      }}
    >
      <DialogContent className="rounded-sm bg-muted sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create routine tag</DialogTitle>
          <DialogDescription>
            Add a personal classification that can span multiple stations.
          </DialogDescription>
        </DialogHeader>

        <form
          autoComplete="off"
          className="flex flex-col gap-4"
          onSubmit={async event => {
            event.preventDefault();
            await createRoutineTag();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="routine-tag-name">Name</Label>
            <Input
              id="routine-tag-name"
              value={name}
              autoComplete="off"
              maxLength={128}
              autoFocus
              onChange={event => setName(event.currentTarget.value)}
              placeholder="High priority"
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex shrink-0 flex-col gap-2">
              <Label>Icon</Label>
              <SupportedIconTable
                value={icon}
                onValueChange={setIcon}
                disabled={routineManager.isCreatingRoutineTag}
                className="bg-muted"
              />
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <Label>Color</Label>
              <ColorSelector
                value={color}
                onValueChange={setColor}
                disabled={routineManager.isCreatingRoutineTag}
                className="bg-muted"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              disabled={routineManager.isCreatingRoutineTag}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={
                routineManager.isCreatingRoutineTag || name.trim().length === 0
              }
            >
              {routineManager.isCreatingRoutineTag && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineTagDialog;
