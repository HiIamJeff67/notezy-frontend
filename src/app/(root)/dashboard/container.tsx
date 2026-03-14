"use client";

import GridBackground from "@/components/GridBackground/GridBackground";
import EditIcon from "@/components/icons/EditIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import XIcon from "@/components/icons/XIcon";
import ImageCropper from "@/components/ImageCropper/ImageCropper";
import ModifyImageHover from "@/components/ModifyImageHover/ModifyImageHover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UploadImageDialog from "@/components/UploadImageDialog/UploadImageDialog";
import {
  BasicWidgetRegistries,
  WidgetRegistryProps,
} from "@/components/widgets/registries";
import { useLanguage, useTheme } from "@/hooks";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { LocalStorageManipulator } from "@shared/lib/localStorageManipulator";
import { ImageInfo } from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { LocalStorageKey } from "@shared/types/localStorage.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const DashboardContainer = () => {
  const themeManager = useTheme();
  const languageManager = useLanguage();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [widgets, setWidgets] = useState<WidgetRegistryProps[]>([]);
  const [backgroundImageURL, setBackgroundImageURL] = useState<string | null>(
    null
  );
  const [uploadBackgroundImageURL, setUploadBackgroundImageURL] = useState<
    string | null
  >(null);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number>(16 / 9);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [imageCropperDialogOpen, setImageCropperDialogOpen] =
    useState<boolean>(false);

  const backgroundDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeWidgets = () => {
      const widgetsEncoded = LocalStorageManipulator.getItemByKey(
        LocalStorageKey.dashboardWidgets
      );
      if (widgetsEncoded !== null) {
        try {
          const widgets = JSON.parse(widgetsEncoded);
          setWidgets(widgets);
        } catch (error) {
          toast.error(languageManager.tError(error));
          setWidgets([]);
        }
      }
    };

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
        image.onload = () => {
          setCropperAspectRatio(image.width / image.height);
        };
      }
    };

    initializeWidgets();
    initializeBackgroundImageURL();
  }, []);

  useLayoutEffect(() => {
    if (backgroundDivRef.current !== null) {
      const { width, height } =
        backgroundDivRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [backgroundImageURL]);

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
              : {
                  backgroundImage: `url(${backgroundImageURL})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
          }
        >
          {isEditing && (
            <ModifyImageHover
              className="absolute"
              imageSrc=""
              imageAlt="Dashboard background image"
              onClick={() => setUploadImageDialogOpen(true)}
              hoverText="點擊以變更背景圖片"
            />
          )}
        </div>
      )}
      <div className="w-full border-2 min-h-2/3 border-none relative overflow-hidden grid grid-cols-12 gap-4 p-4">
        {isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="col-span-2 h-32 flex items-center justify-center border-dashed border-2 border-gray-400 rounded cursor-pointer"
              >
                <PlusIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Basic</DropdownMenuLabel>
                {Object.values(BasicWidgetRegistries).map((widget, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="w-full flex justify-between items-start"
                  >
                    <div className="w-[180px]">
                      <div className="font-bold">{widget.name}</div>
                      <div className="font-light">{widget.description}</div>
                    </div>
                    <div
                      className="w-[100px] aspect-square flex justify-center items-center border-1 rounded-lg overflow-hidden relative pointer-events-none select-none"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <widget.component />
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem></DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <Button
        variant="secondary"
        className="fixed right-4 bottom-4 border border-white rounded-full shadow-lg z-10 w-10 h-10 flex items-center justify-center"
        onClick={() => setIsEditing(prev => !prev)}
      >
        {isEditing ? <XIcon size={18} /> : <EditIcon />}
      </Button>
      <UploadImageDialog
        open={uploadImageDialogOpen}
        onOpenChange={setUploadImageDialogOpen}
        title="Upload Background Images"
        onUpload={async (files: File[]) => {
          const imageInfo: ImageInfo = (await IndexedDBManipulator.getItemByKey(
            IndexedDBKey.backgroundImages
          )) ?? {
            header: { totalSize: 0 },
            content: [],
          };
          const url = URL.createObjectURL(files[files.length - 1]);
          const image = new Image();
          image.src = url;
          image.onload = () => {
            setCropperAspectRatio(image.width / image.height);
          };
          setUploadBackgroundImageURL(url);
          let lastId: UUID = generateUUID();
          files.forEach(file => {
            lastId = generateUUID();
            imageInfo.header.totalSize += file.size;
            imageInfo.content.push({
              id: lastId,
              contentType: file.type,
              file: file,
              timestamp: new Date(),
            });
          });
          await IndexedDBManipulator.setItem(
            IndexedDBKey.backgroundImages,
            imageInfo
          );
          await IndexedDBManipulator.setItem(
            IndexedDBKey.currentDashboardBackgroundImageId,
            lastId
          );
          setUploadImageDialogOpen(false);
          setImageCropperDialogOpen(true);
        }}
        onCancel={() => setUploadImageDialogOpen(false)}
      />
      {uploadBackgroundImageURL !== null && (
        <Dialog
          open={imageCropperDialogOpen}
          onOpenChange={setImageCropperDialogOpen}
        >
          <DialogContent className="max-w-md shadow-xl rounded-xl p-6 flex flex-col items-center gap-4">
            <DialogHeader>
              <DialogTitle>Crop Background Image</DialogTitle>
            </DialogHeader>
            <ImageCropper
              imageURL={uploadBackgroundImageURL}
              aspectRatio={cropperAspectRatio}
              onComplete={async croppedBlob => {
                const imageInfo: ImageInfo =
                  (await IndexedDBManipulator.getItemByKey(
                    IndexedDBKey.backgroundImages
                  )) ?? { header: { totalSize: 0 }, content: [] };

                const lastImage =
                  imageInfo.content[imageInfo.content.length - 1];
                const url = URL.createObjectURL(lastImage.file);
                setBackgroundImageURL(url);
                if (lastImage) {
                  const croppedFile = new File(
                    [croppedBlob],
                    lastImage.file.name + ".png",
                    { type: croppedBlob.type }
                  );
                  lastImage.file = croppedFile;
                  lastImage.contentType = croppedFile.type;
                  lastImage.timestamp = new Date();
                }
                imageInfo.header.totalSize = imageInfo.content.reduce(
                  (sum, img) => sum + (img.file?.size ?? 0),
                  0
                );
                await IndexedDBManipulator.setItem(
                  IndexedDBKey.backgroundImages,
                  imageInfo
                );
                setImageCropperDialogOpen(false);
              }}
              onCancel={() => setImageCropperDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardContainer;
