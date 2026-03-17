"use client";

import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { Suspense } from "react";

interface DeleteShelfItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dialogHeader: React.ReactNode;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

const DeleteShelfItemDialog = ({
  isOpen,
  onClose,
  dialogHeader,
  onDelete,
  onCancel,
}: DeleteShelfItemDialogProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle />
        <DialogHeader>{dialogHeader}</DialogHeader>
        <DialogContent>
          <Button type="submit" onClick={onDelete} className="w-3/10">
            Delete
          </Button>
          <Button
            className="w-3/10 bg-destructive hover:bg-destructive/90"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </Suspense>
  );
};

export default DeleteShelfItemDialog;
