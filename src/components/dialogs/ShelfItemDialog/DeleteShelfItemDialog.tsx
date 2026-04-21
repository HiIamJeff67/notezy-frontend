"use client";

import React, { Suspense, useState } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModalProps } from "@/providers/ModalProvider";

interface DeleteShelfItemDialogProps extends ModalProps {
  dialogHeader: React.ReactNode;
  confirmKeyword?: string;
  inputPlaceholder?: string;
  onDelete: () => void | Promise<void>;
  onCancel: () => void;
}

const DeleteShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  confirmKeyword,
  inputPlaceholder,
  onDelete,
  onCancel,
}: DeleteShelfItemDialogProps) => {
  const [value, setValue] = useState<string>("");

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-muted">
          <DialogHeader>
            <DialogTitle>{dialogHeader}</DialogTitle>
          </DialogHeader>
          {confirmKeyword !== undefined && (
            <Input
              placeholder={inputPlaceholder}
              value={value}
              onChange={e => setValue(e.target.value)}
              className={`w-full ${value === confirmKeyword ? "" : "border-2 border-destructive/50"}`}
            />
          )}

          <div className="w-full flex flex-row justify-center gap-4">
            <Button
              type="submit"
              onClick={async () => {
                if (confirmKeyword !== undefined && value !== confirmKeyword)
                  return;
                await onDelete();
                setValue("");
                onClose();
              }}
              className="w-3/10"
            >
              Delete
            </Button>
            <Button
              className="w-3/10 bg-destructive hover:bg-destructive/90"
              onClick={() => {
                onCancel();
                onClose();
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
};

export default DeleteShelfItemDialog;
