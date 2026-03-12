"use client";

import DropFileZone from "@/components/DropFileZone/DropFileZone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/hooks";
import { useState } from "react";
import XIcon from "../icons/XIcon";

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
  const theme = useTheme();
  const [uploadedImages, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const handleDrop = (files: File[]) => {
    if (files.length > maxCount) {
      setError(
        `You can only upload max to ${maxCount} images at the same time`
      );
      return;
    }
    setSelectedFiles(files);
    setError("");
  };

  const handleUpload = () => {
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
        <DialogTitle>{title}</DialogTitle>
        <DropFileZone
          accept={{ "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"] }}
          multiple={maxCount > 1}
          disabled={false}
          width="100%"
          height="140px"
          className="mb-2"
          onDrop={handleDrop}
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
                key={image.name}
                className="relative w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border"
              >
                <button // we don't use <Button /> component here, since it will cause some padding or margin like UI problem
                  className="absolute top-1 left-1 w-3 h-3 flex justify-center items-center rounded-full bg-(--destructive)"
                  onClick={() => {
                    setSelectedFiles(
                      uploadedImages.filter((_, i) => i !== index)
                    );
                  }}
                  type="button"
                >
                  <XIcon size={8} />
                </button>
                <img
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  className="object-cover w-full h-full"
                />
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
            onClick={handleUpload}
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
