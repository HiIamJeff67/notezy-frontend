"use client";

import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import { Suspense, useCallback, useState } from "react";
import toast from "react-hot-toast";

interface CreateRootShelfDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRootShelfDialog = ({
  isOpen,
  onClose,
}: CreateRootShelfDialogProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfMaterialManager = useShelfMaterial();

  const [newShelfName, setNewShelfName] = useState<string>("");

  const handleCreateRootShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsStrictLoading(true);

    try {
      if (newShelfName.replaceAll(" ", "") === "") {
        throw new Error("new shelf name must not be empty");
      }

      await shelfMaterialManager.createRootShelf(newShelfName);
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      setNewShelfName("");
      loadingManager.setIsStrictLoading(false);
    }
  }, [newShelfName, loadingManager, languageManager, shelfMaterialManager]);

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle />
        <DialogContent className="w-4/5">
          <DialogHeader className="w-full">
            Create a Root Shelf by Typing an New Name
          </DialogHeader>
          <Input
            placeholder="type your new and unique shelf name here"
            value={newShelfName}
            onChange={e => setNewShelfName(e.target.value)}
            className="w-full caret-foreground"
          />

          <div className="w-full flex flex-row justify-center gap-4">
            <Button
              type="submit"
              onClick={handleCreateRootShelfOnSubmit}
              className="w-3/10"
            >
              Create
            </Button>
            <Button
              className="w-3/10 bg-destructive hover:bg-destructive/90"
              onClick={() => {
                setNewShelfName("");
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

export default CreateRootShelfDialog;
