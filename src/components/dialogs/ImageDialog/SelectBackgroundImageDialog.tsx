import type { UUID } from "crypto";
import { useCallback, useState, useTransition } from "react";
import toast from "react-hot-toast";
import Closeable from "@/components/commons/Closeable/Closeable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage, useLoading } from "@/hooks";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";
import { useRegisterLoadingDependencies } from "@/hooks/useLoading";
import { ModalProps } from "@/providers/ModalProvider";
import CropImageDialog from "./CropImageDialog";
import UploadImageDialog from "./UploadImageDialog";

interface SelectBackgroundImageDialogProps extends ModalProps {
  cropperAspectRatio: number;
}

const SelectBackgroundImageDialog = ({
  isOpen,
  onClose,
  cropperAspectRatio,
}: SelectBackgroundImageDialogProps) => {
  const languageManager = useLanguage();
  const loadingManager = useLoading();

  const backgroundImagesManager = useBackgroundImages();

  const thumbnails = backgroundImagesManager.thumbnails?.contents || [];

  const [selectedBackgroundImageId, setSelectedBackgroundImageId] =
    useState<UUID | null>(null);
  const [croppedBackgroundImagePack, setCroppedBackgroundImagePack] = useState<{
    url: string;
    revoke: () => void;
  } | null>(null);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [cropImageDialogOpen, setCropImageDialogOpen] =
    useState<boolean>(false);

  const [isCropImageCompleting, startCompletingCropImageTransition] =
    useTransition();
  const [isCropImageSelecting, startSelectingCropImageTransition] =
    useTransition();

  useRegisterLoadingDependencies(
    () => isCropImageCompleting,
    () => isCropImageSelecting
  );

  const handleCropImageOnComplete = useCallback(
    async (croppedBlob: Blob) =>
      startCompletingCropImageTransition(async () => {
        try {
          if (croppedBackgroundImagePack === null) {
            throw new Error("failed to crop null image");
          }

          const croppedFile = new File(
            [croppedBlob],
            `cropped-image-${Date.now()}.png`,
            {
              type: "image/png",
            }
          );
          const uploadedIds = await backgroundImagesManager.upload([
            croppedFile,
          ]); // this should be at most one files
          if (uploadedIds.length > 0) {
            if (selectedBackgroundImageId) {
              await backgroundImagesManager.remove([selectedBackgroundImageId]);
            }
            setSelectedBackgroundImageId(uploadedIds[0]);
          }
          URL.revokeObjectURL(croppedBackgroundImagePack.url);
          setCroppedBackgroundImagePack(null);
          setCropImageDialogOpen(false);
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [
      croppedBackgroundImagePack,
      selectedBackgroundImageId,
      backgroundImagesManager,
      languageManager,
    ]
  );

  const handleCropImageOnSelect = useCallback(
    () =>
      startSelectingCropImageTransition(async () => {
        try {
          if (!selectedBackgroundImageId) return;

          const imagePack = await backgroundImagesManager.getFullImageURL(
            selectedBackgroundImageId
          );
          setCroppedBackgroundImagePack(imagePack);
          setCropImageDialogOpen(true);
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [selectedBackgroundImageId, backgroundImagesManager, languageManager]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="
          w-[95vw] 
          max-w-md 
          md:max-w-2xl 
          lg:max-w-3xl 
          bg-card shadow-xl rounded-xl p-6 flex flex-col items-center gap-4
        "
      >
        <DialogHeader>
          <DialogTitle>Select Background Images</DialogTitle>
        </DialogHeader>

        <UploadImageDialog
          open={uploadImageDialogOpen}
          onOpenChange={setUploadImageDialogOpen}
          title="Upload Background Images"
          onUpload={async (files: File[]) => {
            await backgroundImagesManager.upload(files);
          }}
          onCancel={() => setUploadImageDialogOpen(false)}
        />
        {croppedBackgroundImagePack !== null && (
          <CropImageDialog
            open={cropImageDialogOpen}
            onOpenChange={setCropImageDialogOpen}
            imageURL={croppedBackgroundImagePack.url}
            aspectRatio={cropperAspectRatio}
            onComplete={handleCropImageOnComplete}
            onCancel={() => {
              croppedBackgroundImagePack.revoke();
              setCroppedBackgroundImagePack(null);
              setCropImageDialogOpen(false);
            }}
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[60vh] w-full mt-4 p-2">
          {thumbnails.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No background images available.
            </div>
          ) : (
            thumbnails.map(thumb => (
              <div
                key={thumb.id}
                onClick={() => setSelectedBackgroundImageId(thumb.id)}
                className={`
                    cursor-pointer relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                    ${
                      selectedBackgroundImageId === thumb.id
                        ? "border-primary shadow-lg scale-105"
                        : "border-transparent hover:border-foreground/50"
                    }
                    `}
              >
                <Closeable
                  onClose={() => backgroundImagesManager.remove([thumb.id])}
                  hasParent
                >
                  {/* leave the client images to use the original react img component */}
                  <img
                    src={thumb.thumbnailURL}
                    alt="Background thumbnail"
                    className="w-full h-full object-cover"
                  />
                </Closeable>
              </div>
            ))
          )}
        </div>
        <div className="w-full flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            className="w-20"
            disabled={selectedBackgroundImageId === null}
            onClick={handleCropImageOnSelect}
          >
            Crop
          </Button>
          <Button
            variant="secondary"
            className="w-20"
            onClick={() => setUploadImageDialogOpen(true)}
          >
            Upload
          </Button>
          <Button
            variant="default"
            className="w-20"
            onClick={async () => {
              await backgroundImagesManager.setCurrentBackgroundImageId(
                selectedBackgroundImageId
              );
              onClose();
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectBackgroundImageDialog;
