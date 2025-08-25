"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useShelf } from "@/hooks/useShelf";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrivateShelfSchema } from "@shared/types/models";
import { useForm } from "react-hook-form";

interface CreateShelfDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateShelfDialog = ({ isOpen, onClose }: CreateShelfDialogProps) => {
  const shelfManager = useShelf();

  const shelfForm = useForm({
    resolver: zodResolver(PrivateShelfSchema),
    defaultValues: {},
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogTitle />
      <DialogContent>CreateShelfDialog</DialogContent>
    </Dialog>
  );
};

export default CreateShelfDialog;
