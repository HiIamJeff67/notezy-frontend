import toast from "@shared/lib/toast";
import type { UUID } from "crypto";
import { useCallback, useEffect, useState, useTransition } from "react";
import Closeable from "@/components/commons/Closeable/Closeable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks";
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

  useEffect(() => {
    const currentId = backgroundImagesManager.currentBackgroundImage?.id ?? null;
    if (currentId && thumbnails.some(thumb => thumb.id === currentId)) {
      setSelectedBackgroundImageId(currentId);
      return;
    }

    if (thumbnails.length === 0) {
      setSelectedBackgroundImageId(null);
    } else if (selectedBackgroundImageId === null) {
      setSelectedBackgroundImageId(thumbnails[thumbnails.length - 1].id);
    }
  }, [
    backgroundImagesManager.currentBackgroundImage?.id,
    thumbnails,
    selectedBackgroundImageId,
  ]);

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
          await backgroundImagesManager.setCurrentBackgroundImageByFile(
            croppedFile
          );
          URL.revokeObjectURL(croppedBackgroundImagePack.url);
          setCroppedBackgroundImagePack(null);
          setCropImageDialogOpen(false);
        } catch (error) {
          toast.error(languageManager.tError(error));
        }
      }),
    [croppedBackgroundImagePack, backgroundImagesManager, languageManager]
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

  const handleThumbnailOnSelect = useCallback(
    async (id: UUID) => {
      setSelectedBackgroundImageId(id);
      try {
        await backgroundImagesManager.setCurrentBackgroundImageById(id);
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    },
    [backgroundImagesManager, languageManager]
  );

  const handleThumbnailOnRemove = useCallback(
    async (id: UUID) => {
      try {
        const remainingIds = thumbnails
          .filter(thumb => thumb.id !== id)
          .map(thumb => thumb.id);
        const fallbackId =
          remainingIds.length > 0 ? remainingIds[remainingIds.length - 1] : null;

        await backgroundImagesManager.remove([id]);
        setSelectedBackgroundImageId(fallbackId);
        await backgroundImagesManager.setCurrentBackgroundImageById(fallbackId);
      } catch (error) {
        toast.error(languageManager.tError(error));
      }
    },
    [backgroundImagesManager, languageManager, thumbnails]
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
        <DialogDescription className="px-4">
          Select a image to display on the background. There's only one image
          available to display at the same time.
        </DialogDescription>
        <UploadImageDialog
          open={uploadImageDialogOpen}
          onOpenChange={setUploadImageDialogOpen}
          title="Upload Background Images"
          onUpload={async (files: File[]) => {
            const uploadedIds = await backgroundImagesManager.upload(files);
            if (uploadedIds.length > 0) {
              const lastUploadedId = uploadedIds[uploadedIds.length - 1];
              setSelectedBackgroundImageId(lastUploadedId);
              await backgroundImagesManager.setCurrentBackgroundImageById(
                lastUploadedId
              );
            }
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
                onClick={() => handleThumbnailOnSelect(thumb.id)}
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
                  onClose={() => handleThumbnailOnRemove(thumb.id)}
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
            disabled={selectedBackgroundImageId === null}
            onClick={() => onClose()}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectBackgroundImageDialog;
