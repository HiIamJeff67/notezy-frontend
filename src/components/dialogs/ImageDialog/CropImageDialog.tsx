import ImageCropper from "@/components/commons/ImageCropper/ImageCropper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CropImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageURL: string;
  aspectRatio?: number;
  onComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const CropImageDialog = ({
  open,
  onOpenChange,
  imageURL,
  aspectRatio,
  onComplete,
  onCancel,
}: CropImageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md shadow-xl rounded-xl p-6 flex flex-col items-center gap-4">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <ImageCropper
          imageURL={imageURL}
          aspectRatio={aspectRatio}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CropImageDialog;
