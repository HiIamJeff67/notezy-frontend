"use client";

import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import PlaceableBackground from "@/components/backgrounds/PlaceableBackground/PlaceableBackground";
import Closeable from "@/components/commons/Closeable/Closeable";
import Draggable from "@/components/commons/Draggable/Draggable";
import Editable from "@/components/commons/Editable/Editable";
import ImageCropper from "@/components/commons/ImageCropper/ImageCropper";
import UploadImageDialog from "@/components/dialogs/UploadImageDialog/UploadImageDialog";
import CreateWidgetDialog from "@/components/dialogs/WidgetDialog/CreateWidgetDialog";
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
import { PreviewWidget, toWidget, Widget } from "@/components/widgets/widget";
import { useLanguage, useTheme } from "@/hooks";
import { useScreen } from "@/hooks/useScreen";
import { useWidget } from "@/hooks/useWidget";
import { DNDType } from "@shared/enums";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { ImageInfo } from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DropTargetMonitor } from "react-dnd";

const DashboardElementZIndexes = {
  headerBackgroundImage: 50,
  placeableBackground: 50,
  placeableFrames: 50,
  widgets: {
    draggable: 75,
    editable: 125,
    closeable: 125,
    content: 100,
  },
  editButton: 150,
  // all the dialogs can be consider to have the same z index of infinity
};

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
  const [frameSize, setFrameSize] = useState<number>(0);
  const [currentFramePosition, setCurrentFramePosition] = useState<{
    leftFrameCount: number;
    topFrameCount: number;
  }>({ leftFrameCount: 0, topFrameCount: 0 });
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [imageCropperDialogOpen, setImageCropperDialogOpen] =
    useState<boolean>(false);
  const [createWidgetDialogOpen, setCreateWidgetDialogOpen] =
    useState<boolean>(false);

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);
  const potentialConflictingWidgetsRef = useRef<Widget[]>(
    widgetManager.widgets
  );

  const { widthTotalFrameCount, heightTotalFrameCount, frameGap } =
    useMemo(() => {
      let widthTotalFrameCount = 4;
      let frameGap = 4;
      switch (screenManager.breakpoint) {
        case "base":
        case "sm":
          widthTotalFrameCount = 4;
          break;
        case "md":
        case "lg":
          widthTotalFrameCount = 6;
          break;
        case "xl":
          widthTotalFrameCount = 8;
          frameGap = 6;
          break;
        case "2xl":
          widthTotalFrameCount = 12;
          break;
        case "3xl":
          widthTotalFrameCount = 16;
          break;
      }

      let heightTotalFrameCount = 0;
      widgetManager.widgets.forEach(widget => {
        heightTotalFrameCount = Math.max(
          heightTotalFrameCount,
          widget.position.topFrameCount + widget.size.heightFrameCount
        );
      });
      return {
        widthTotalFrameCount: widthTotalFrameCount,
        heightTotalFrameCount: heightTotalFrameCount,
        frameGap: frameGap,
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

  useEffect(() => {
    potentialConflictingWidgetsRef.current = widgetManager.widgets;
  }, [widgetManager.widgets]);

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [headerBackgroundImageURL]);

  const handleCreateWidgetOnClick = useCallback(
    (previewWidget: PreviewWidget) => {
      const createdFramePosition = currentFramePosition;
      if (
        createdFramePosition.leftFrameCount +
          previewWidget.size.widthFrameCount >
        widthTotalFrameCount
      ) {
        createdFramePosition.leftFrameCount = 0;
        let availableTopFrameCount = 0;
        widgetManager.widgets.forEach(widget => {
          if (
            widget.position.leftFrameCount < previewWidget.size.widthFrameCount
          ) {
            availableTopFrameCount = Math.max(
              availableTopFrameCount,
              widget.position.topFrameCount + widget.size.heightFrameCount
            );
          }
        });
        createdFramePosition.topFrameCount = availableTopFrameCount;
      }
      widgetManager.append(toWidget(previewWidget, createdFramePosition));
      setCreateWidgetDialogOpen(false);
    },
    [widgetManager, currentFramePosition]
  );

  return (
    <div
      className="
        relative w-full h-full min-h-[calc(100vh-4rem)] overflow-hidden
        flex-col justify-center items-center
      "
    >
      {headerBackgroundImageURL === null ? (
        <GridBackground
          className={`!w-full !min-h-[240] !max-h-[300] relative z-${DashboardElementZIndexes.headerBackgroundImage}`}
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
        </GridBackground>
      ) : (
        <div
          ref={headerBackgroundImageRef}
          className={`w-full min-h-[240] max-h-[300] border-none relative z-${DashboardElementZIndexes.headerBackgroundImage}`}
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
              className="absolute inset-0"
              imageAlt="Dashboard background image"
              onClick={() => setUploadImageDialogOpen(true)}
              hoverText="點擊以變更背景圖片"
            />
          )}
        </div>
      )}
      <PlaceableBackground
        className="overflow-x-hidden overflow-y-auto relative bg-background"
        style={{ height: (heightTotalFrameCount + 1) * frameSize }}
        zIndex={DashboardElementZIndexes.placeableBackground}
        frameSizeSource="horizontal"
        frameSize={frameSize}
        setFrameSize={setFrameSize}
        widthTotalFrameCount={widthTotalFrameCount}
        heightTotalFrameCount={heightTotalFrameCount + 1}
        frameProps={{
          children: <PlusIcon />,
          zIndex: DashboardElementZIndexes.placeableFrames,
          className: "cursor-pointer",
          gap: frameGap,
          isEditing: isEditing,
          droppableProps: {
            type: DNDType.DraggableWidget,
            hover: (_, monitor) => {
              if (!monitor.canDrop()) return;
            },
            canDrop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: {
                leftFrameCount: number;
                topFrameCount: number;
              }
            ) => {
              return !potentialConflictingWidgetsRef.current.some(
                widget =>
                  widget.id != draggedItem.id &&
                  widget.position.leftFrameCount > position.leftFrameCount &&
                  widget.position.leftFrameCount <
                    position.leftFrameCount +
                      draggedItem.size.widthFrameCount &&
                  widget.position.topFrameCount > position.topFrameCount &&
                  widget.position.topFrameCount <
                    position.topFrameCount + draggedItem.size.heightFrameCount
              );
            },
            drop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: {
                leftFrameCount: number;
                topFrameCount: number;
              }
            ) => {
              widgetManager.updateByWidget(draggedItem, "position", position);
            },
          },
          onClick: (position: {
            leftFrameCount: number;
            topFrameCount: number;
          }) => {
            setCreateWidgetDialogOpen(true);
            setCurrentFramePosition(position);
          },
        }}
      >
        {widgetManager.widgets.map((widget, index) => (
          <Draggable // a draggable wrapper to locate the widget base on the correct position
            key={index}
            style={{
              left: widget.position.leftFrameCount * frameSize + frameGap,
              top: widget.position.topFrameCount * frameSize + frameGap,
              width: widget.size.widthFrameCount * frameSize - frameGap,
              height: widget.size.heightFrameCount * frameSize - frameGap,
              zIndex: DashboardElementZIndexes.widgets.draggable,
            }}
            className="absolute shadow rounded-lg"
            type={DNDType.DraggableWidget}
            item={widget}
            canDrag={isEditing}
          >
            <Editable
              editButtonProps={{
                className: `!top-1 !left-6 w-4 h-4 !bg-transparent border-1 border-foreground !z-${DashboardElementZIndexes.widgets.editable}`,
                disabled: !isEditing,
                size: 10,
              }}
              onEdit={() => console.log("editing the widget...")}
            >
              <Closeable
                closeButtonProps={{
                  className: `top-1 left-1 w-4 h-4 !bg-transparent border-1 border-foreground !z-${DashboardElementZIndexes.widgets.closeable}`,
                  disabled: !isEditing,
                  size: 12,
                }}
                onClose={() => widgetManager.remove(index)}
              >
                <widget.component
                  style={{
                    width: widget.size.widthFrameCount * frameSize - frameGap,
                    height: widget.size.heightFrameCount * frameSize - frameGap,
                    zIndex: DashboardElementZIndexes.widgets.content,
                  }}
                  className="bg-background/80 border-1 border-foreground/20 rounded-lg"
                />
              </Closeable>
            </Editable>
          </Draggable>
        ))}
        {isEditing ? (
          <Button
            variant="secondary"
            style={{ zIndex: DashboardElementZIndexes.editButton }}
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
            style={{ zIndex: DashboardElementZIndexes.editButton }}
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
      <CreateWidgetDialog
        open={createWidgetDialogOpen}
        onOpenChange={setCreateWidgetDialogOpen}
        onCreate={handleCreateWidgetOnClick}
      />
    </div>
  );
};

export default DashboardContainer;
