import React, { Suspense, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
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
import { ModalProps } from "@/providers/ModalProvider";

interface CreateShelfItemDialogProps extends ModalProps {
  dialogHeader: React.ReactNode;
  dialogDescription: React.ReactNode;
  disableInput?: boolean;
  inputPlaceholder?: string;
  onCreate: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

const CreateShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  dialogDescription,
  disableInput = false,
  inputPlaceholder,
  onCreate,
  onCancel,
}: CreateShelfItemDialogProps) => {
  const [value, setValue] = useState<string>("");

  const createShelfItem = async () => {
    await onCreate(value);
    setValue("");
    onClose();
  };

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-muted w-4/5">
          <DialogHeader className="w-full">
            <DialogTitle>{dialogHeader}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{dialogDescription}</DialogDescription>
          {!disableInput && (
            <Input
              placeholder={inputPlaceholder}
              value={value}
              autoComplete="off"
              onChange={e => setValue(e.target.value)}
              className="w-full"
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onCancel();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="default" onClick={createShelfItem}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
};

export default CreateShelfItemDialog;
