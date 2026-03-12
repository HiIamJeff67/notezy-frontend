"use client";

import GridBackground from "@/components/GridBackground/GridBackground";
import ModifyImageHover from "@/components/Hovers/ModifyImageHover";
import EditIcon from "@/components/icons/EditIcon";
import XIcon from "@/components/icons/XIcon";
import ImageCropper from "@/components/ImageCropper/ImageCropper";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import UploadImageDialog from "@/components/UploadImageDialog/UploadImageDialog";
import { WidgetRegistryProps } from "@/components/widgets/registries";
import { useTheme } from "@/hooks";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { Color, getPaletteSync } from "colorthief";
import { useEffect, useState } from "react";

const DashboardContainer = () => {
  const themeManager = useTheme();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<WidgetRegistryProps[]>([]);
  const [backgroundImageURL, setBackgroundImageURL] = useState<string | null>(
    null
  );
  const [palette, setPalette] = useState<Color[] | null>(null);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [imageCropperDialogOpen, setImageCropperDialogOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const initializeBackgroundImageURL = async () => {
      const imageId = await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.currentDashboardBackgroundImageId
      );
      if (imageId === null) return;

      const imageInfo = await IndexedDBManipulator.getItemByKey(
        IndexedDBKey.backgroundImages
      );
      if (imageInfo === null || imageInfo.content.length === 0) return;

      const target = imageInfo.content.find(image => image.id === imageId);
      if (target !== undefined && target.file) {
        const url = URL.createObjectURL(target.file);
        setBackgroundImageURL(url);

        const image = new Image();
        image.src = url;
        const palette = getPaletteSync(image, { colorCount: 6 });
        setPalette(palette);
      }
    };

    initializeBackgroundImageURL();
  }, []);

  useEffect(() => {
    if (!isEditing) {
      LocalStorageManipulator.setItem(
        LocalStorageKey.dashboardWidgets,
        JSON.stringify(widgets)
      );
    }
  }, [isEditing]);

  return (
    <div className="w-full h-full flex-col justify-between items-center min-h-[calc(100vh-4rem)] overflow-auto relative">
      {backgroundImageURL === null ? (
        <GridBackground className="!w-full !min-h-1/3 !max-h-full relative">
          {isEditing && (
            <ModifyImageHover
              className="absolute"
              imageSrc=""
              imageAlt="Dashboard background image"
              onClick={() => setUploadImageDialogOpen(true)}
              hoverText="點擊以變更背景圖片"
            />
          )}
        </GridBackground>
      ) : (
        <div
          className="w-full min-h-1/3 max-h-full border-none relative"
          style={
            backgroundImageURL === null
              ? {}
              : { backgroundImage: `url(${backgroundImageURL})` }
          }
        >
          {isEditing && (
            <ModifyImageHover
              className="absolute"
              imageSrc=""
              imageAlt="Dashboard background image"
              onClick={() => {}}
              hoverText="點擊以變更背景圖片"
            />
          )}
        </div>
      )}
      <div className="w-full border-2 min-h-2/3 border-none relative overflow-hidden">
        {palette && palette.length > 0 ? (
          palette.map((color, idx) => (
            <div
              key={idx}
              className="absolute rounded-full blur-[80px] opacity-60"
              style={{
                background: color.css(),
                width: 300,
                height: 300,
                left: `${idx * 120}px`,
                top: `${idx * 80}px`,
                zIndex: 0,
              }}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-(--background) backdrop-blur-[40px] z-0" />
        )}
      </div>
      <Button
        variant="secondary"
        className="fixed right-4 bottom-4 border border-white rounded-full shadow-lg z-10 w-10 h-10 flex items-center justify-center"
        onClick={() => setIsEditing(prev => !prev)}
      >
        {isEditing ? <XIcon /> : <EditIcon />}
      </Button>
      <UploadImageDialog
        open={uploadImageDialogOpen}
        onOpenChange={setUploadImageDialogOpen}
        title="Upload Background Images"
        onUpload={(files: File[]) => {
          console.log(files);
          setUploadImageDialogOpen(false);
        }}
        onCancel={() => setUploadImageDialogOpen(false)}
      />
      {backgroundImageURL !== null && (
        <Dialog
          open={imageCropperDialogOpen}
          onOpenChange={setImageCropperDialogOpen}
        >
          <DialogContent>
            <ImageCropper
              imageURL={backgroundImageURL}
              onComplete={() => {}}
              onCancel={() => setImageCropperDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardContainer;
