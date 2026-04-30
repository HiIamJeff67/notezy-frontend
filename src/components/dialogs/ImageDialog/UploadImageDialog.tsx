import { Image } from "@unpic/react";
import { useState } from "react";
import Closeable from "@/components/commons/Closeable/Closeable";
import DropFileZone from "@/components/commons/DropFileZone/DropFileZone";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxCount?: number;
  title?: string;
  onUpload: (files: File[]) => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

const UploadImageDialog: React.FC<UploadImageDialogProps> = ({
  open,
  onOpenChange,
  maxCount = 5,
  title = "Upload Image",
  onUpload,
  onCancel,
}) => {
  const [uploadedImages, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const handleOnDrop = (files: File[]) => {
    if (files.length > maxCount) {
      setError(
        `You can only upload max to ${maxCount} images at the same time`
      );
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    setError("");
  };

  const handleOnUpload = () => {
    if (uploadedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }
    onUpload(uploadedImages);
    setSelectedFiles([]);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card shadow-xl rounded-xl p-6 flex flex-col items-center gap-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DropFileZone
          accept={{ "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] }}
          multiple={maxCount > 1}
          disabled={false}
          width="100%"
          height="140px"
          className="mb-2"
          onDrop={handleOnDrop}
        >
          <div className="flex-col justify-center items-center">
            <p className="text-sm text-muted-foreground">
              Drop Files or Click Here to Select Uploaded Images
            </p>
            <p className="text-sm text-muted-foreground">{`(You can only upload max to ${maxCount} images at the same time)`}</p>
          </div>
        </DropFileZone>
        {uploadedImages.length > 0 && (
          <div className="w-full flex flex-wrap gap-2 mt-2">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="w-16 h-16 relative rounded-lg overflow-hidden"
              >
                <Closeable
                  className="w-2 h-2 top-1 left-1 absolute"
                  onClose={() => {
                    setSelectedFiles(
                      uploadedImages.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Image
                    src={URL.createObjectURL(image)}
                    width={160}
                    height={160}
                    alt={image.name}
                    className="object-cover w-full h-full"
                  />
                </Closeable>
              </div>
            ))}
          </div>
        )}
        {error && <div className="text-destructive text-sm">{error}</div>}
        <div className="w-full flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleOnUpload}
            disabled={uploadedImages.length === 0}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadImageDialog;
