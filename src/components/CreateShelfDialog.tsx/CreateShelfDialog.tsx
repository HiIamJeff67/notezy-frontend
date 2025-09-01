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
import { useLanguage, useLoading, useShelf } from "@/hooks";
import { Suspense, useCallback, useState } from "react";
import toast from "react-hot-toast";

interface CreateShelfDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateShelfDialog = ({ isOpen, onClose }: CreateShelfDialogProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfManager = useShelf();

  const [newShelfName, setNewShelfName] = useState<string>("");

  const handleCreateShelfOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsLoading(true);

    try {
      if (newShelfName.replaceAll(" ", "") === "") {
        throw new Error("new shelf name must not be empty");
      }

      await shelfManager.createRootShelf(newShelfName);
      onClose();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      setNewShelfName("");
      loadingManager.setIsLoading(false);
    }
  }, [newShelfName, loadingManager, languageManager, shelfManager]);

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogTitle />
        <DialogContent className="w-4/5">
          <DialogHeader className="w-full">
            Create Shelf by Typing an New Name
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
              onClick={handleCreateShelfOnSubmit}
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

export default CreateShelfDialog;
