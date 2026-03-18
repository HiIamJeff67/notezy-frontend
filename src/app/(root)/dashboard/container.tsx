"use client";

import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import PlaceableBackground from "@/components/backgrounds/PlaceableBackground/PlaceableBackground";
import Closeable from "@/components/commons/Closeable/Closeable";
import ImageCropper from "@/components/commons/ImageCropper/ImageCropper";
import UploadImageDialog from "@/components/dialogs/UploadImageDialog/UploadImageDialog";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import CheckIcon from "@/components/icons/CheckIcon";
import EditIcon from "@/components/icons/EditIcon";
import PlusIcon from "@/components/icons/PlusIcon";
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
import { BasicPreviewWidgets, toWidget } from "@/components/widgets/widget";
import { useLanguage, useTheme } from "@/hooks";
import { useScreen } from "@/hooks/useScreen";
import { useWidget } from "@/hooks/useWidget";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { ImageInfo } from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const DashboardContainer = () => {
  const screenManager = useScreen();
  const themeManager = useTheme();
  const languageManager = useLanguage();
  const widgetManager = useWidget();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [headerBackgroundImageURL, setHeaderBackgroundImageURL] = useState<
    string | null
  >(null);
  const [uploadHeaderBackgroundImageURL, setUploadHeaderBackgroundImageURL] =
    useState<string | null>(null);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number>(16 / 9);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [imageCropperDialogOpen, setImageCropperDialogOpen] =
    useState<boolean>(false);
  const [frameSize, setFrameSize] = useState<number>(120);

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);

  const { horizontalFrameCount, verticalFrameCount, gap } = useMemo(() => {
    let horizontalFrameCount = 4;
    let gap = 4;
    switch (screenManager.breakpoint) {
      case "base":
      case "sm":
        horizontalFrameCount = 4;
        break;
      case "md":
      case "lg":
        horizontalFrameCount = 6;
        break;
      case "xl":
        horizontalFrameCount = 8;
        gap = 6;
        break;
      case "2xl":
        horizontalFrameCount = 12;
        break;
      case "3xl":
        horizontalFrameCount = 16;
        break;
    }

    let verticalFrameCount = 0;
    for (const widget of widgetManager.widgets) {
      verticalFrameCount = Math.max(
        verticalFrameCount,
        widget.topFrameCount + widget.heightFrameCount
      );
    }
    return {
      horizontalFrameCount: horizontalFrameCount,
      verticalFrameCount: verticalFrameCount + 1, // at least one empty row
      gap: gap,
    };
  }, [screenManager.breakpoint, widgetManager.widgets]);

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
        setHeaderBackgroundImageURL(url);
        const image = new Image();
        image.src = url;
        image.onload = () => setCropperAspectRatio(image.width / image.height);
      }
    };

    initializeBackgroundImageURL();
  }, []);

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [headerBackgroundImageURL]);

  return (
    <div className="w-full h-full flex-col justify-center items-center min-h-[calc(100vh-4rem)] overflow-x-hidden overflow-y-scroll relative">
      {headerBackgroundImageURL === null ? (
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
          ref={headerBackgroundImageRef}
          className="w-full min-h-1/3 max-h-full border-none relative"
          style={
            headerBackgroundImageURL === null
              ? {}
              : {
                  backgroundImage: `url(${headerBackgroundImageURL})`,
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
      {/* <div
        className="
          w-full border-2 min-h-2/3 border-none relative overflow-hidden 
          flex flex-wrap items-start gap-4 p-4
        "
      >
        {widgetManager.widgets.map((widget, index) => (
          <Closeable
            key={index}
            className="border-1 border-foreground shadow"
            closeButtonClassName="top-1 left-1 w-4 h-4 border-1 border-foreground/70 !bg-transparent"
            iconSize={12}
            displayCloseButton={isEditing}
            onClose={() => widgetManager.remove(index)}
          >
            <widget.component />
          </Closeable>
        ))}
        {isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="col-span-full h-32 flex justify-center items-center aspect-square border-dashed border-2 border-gray-400 rounded cursor-pointer"
              >
                <PlusIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Basic</DropdownMenuLabel>
                {Object.values(BasicWidgets).map((previewWidget, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="w-full flex justify-between items-start"
                    onClick={() => widgetManager.append(previewWidget)}
                  >
                    <div className="w-[180px]">
                      <div className="font-bold">{previewWidget.name}</div>
                      <div className="font-light">
                        {previewWidget.description}
                      </div>
                    </div>
                    <div
                      className="w-[100px] aspect-square flex justify-center items-center border-1 rounded-lg overflow-hidden relative pointer-events-none select-none"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <previewWidget.component />
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
      </div> */}
      <PlaceableBackground
        className="m-2 overflow-y-scroll"
        frameSize={frameSize}
        setFrameSize={setFrameSize}
        isEditing={isEditing}
        horizontalFrameCount={horizontalFrameCount}
        verticalFrameCount={verticalFrameCount}
        gap={gap}
        frameChildren={(leftFrameCount: number, topFrameCount: number) =>
          isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-full flex justify-center items-center border-dashed cursor-pointer"
                >
                  <PlusIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Basic</DropdownMenuLabel>
                  {Object.values(BasicPreviewWidgets).map(
                    (previewWidget, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="w-full flex justify-between items-start"
                        onClick={() =>
                          widgetManager.append(
                            toWidget(
                              previewWidget,
                              leftFrameCount,
                              topFrameCount
                            )
                          )
                        }
                      >
                        <div className="w-[180px]">
                          <div className="font-bold">{previewWidget.name}</div>
                          <div className="font-light">
                            {previewWidget.description}
                          </div>
                        </div>
                        <div
                          className="w-[100px] aspect-square flex justify-center items-center border-1 rounded-lg overflow-hidden relative pointer-events-none select-none"
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          <previewWidget.component />
                        </div>
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem></DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      >
        {widgetManager.widgets.map((widget, index) => (
          <Closeable
            key={index}
            style={{
              left:
                widget.leftFrameCount * frameSize +
                (widget.leftFrameCount === 0 ? 0 : gap),
              top:
                widget.topFrameCount * frameSize +
                (widget.topFrameCount === 0 ? 0 : gap),
              width:
                widget.widthFrameCount * frameSize -
                (widget.leftFrameCount === 0 ? 0 : gap),
              height:
                widget.heightFrameCount * frameSize -
                (widget.topFrameCount === 0 ? 0 : gap),
              zIndex: 150,
            }}
            className="absolute border-1 border-foreground shadow"
            closeButtonClassName="top-1 left-1 w-4 h-4 border-1 border-foreground/70 !bg-transparent"
            iconSize={12}
            displayCloseButton={isEditing}
            onClose={() => widgetManager.remove(index)}
          >
            <widget.component
              style={{
                width:
                  widget.widthFrameCount * frameSize -
                  (widget.leftFrameCount === 0 ? 0 : gap),
                height:
                  widget.heightFrameCount * frameSize -
                  (widget.topFrameCount === 0 ? 0 : gap),
              }}
            />
          </Closeable>
        ))}
        {isEditing ? (
          <Button
            variant="secondary"
            style={{ zIndex: 100 }}
            className="fixed right-4 bottom-4 border border-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center"
            onClick={() => {
              widgetManager.sync();
              setIsEditing(false);
            }}
          >
            <CheckIcon size={18} />
          </Button>
        ) : (
          <Button
            variant="secondary"
            style={{ zIndex: 100 }}
            className="fixed right-4 bottom-4 border border-white rounded-full shadow-lg w-10 h-10 flex items-center justify-center"
            onClick={() => setIsEditing(true)}
          >
            <EditIcon size={18} />
          </Button>
        )}
      </PlaceableBackground>
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
          image.onload = () =>
            setCropperAspectRatio(image.width / image.height);
          setUploadHeaderBackgroundImageURL(url);
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
      {uploadHeaderBackgroundImageURL !== null && (
        <Dialog
          open={imageCropperDialogOpen}
          onOpenChange={setImageCropperDialogOpen}
        >
          <DialogContent className="max-w-md shadow-xl rounded-xl p-6 flex flex-col items-center gap-4">
            <DialogHeader>
              <DialogTitle>Crop Background Image</DialogTitle>
            </DialogHeader>
            <ImageCropper
              imageURL={uploadHeaderBackgroundImageURL}
              aspectRatio={cropperAspectRatio}
              onComplete={async croppedBlob => {
                const imageInfo: ImageInfo =
                  (await IndexedDBManipulator.getItemByKey(
                    IndexedDBKey.backgroundImages
                  )) ?? { header: { totalSize: 0 }, content: [] };

                const lastImage =
                  imageInfo.content[imageInfo.content.length - 1];
                const url = URL.createObjectURL(lastImage.file);
                setHeaderBackgroundImageURL(url);
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
