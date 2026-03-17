"use client";

import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Suspense, useState } from "react";

interface CreateShelfItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dialogHeader: React.ReactNode;
  disableInput?: boolean;
  inputPlaceholder?: string;
  onCreate: (value: string) => Promise<void>;
  onCancel: () => void;
}

const CreateShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  disableInput = false,
  inputPlaceholder,
  onCreate,
  onCancel,
}: CreateShelfItemDialogProps) => {
  const [value, setValue] = useState<string>("");

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle />
        <DialogContent className="w-4/5">
          <DialogHeader className="w-full">{dialogHeader}</DialogHeader>
          {!disableInput && (
            <Input
              placeholder={inputPlaceholder}
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full"
            />
          )}

          <div className="w-full flex flex-row justify-center gap-4">
            <Button
              type="submit"
              onClick={async () => await onCreate(value)}
              className="w-3/10"
            >
              Create
            </Button>
            <Button
              className="w-3/10 bg-destructive hover:bg-destructive/90"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
};

export default CreateShelfItemDialog;
