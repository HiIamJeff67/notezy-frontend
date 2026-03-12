"use client";

import React, { useState } from "react";
import Cropper, { Area } from "react-easy-crop";

interface ImageCropperProps {
  imageURL: string;
  onComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageURL,
  onComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const getCroppedImage = async (
    imageURL: string,
    crop: Area
  ): Promise<Blob> => {
    const image = new Image();
    image.src = imageURL;
    await new Promise(resolve => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get context from canvas");

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob!);
      }, "image/png");
    });
  };

  const handleOnCropComplete = (
    _croppedArea: Area,
    croppedAreaPixels: Area
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 shadow-lg relative w-[400px] h-[400px]">
        <Cropper
          image={imageURL}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleOnCropComplete}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>
            取消
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={async () => {
              if (!croppedAreaPixels) return;
              const croppedBlob = await getCroppedImage(
                imageURL,
                croppedAreaPixels
              );
              onComplete(croppedBlob);
            }}
          >
            完成裁切
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
