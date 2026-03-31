"use client";

import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import PlaceableBackground from "@/components/backgrounds/PlaceableBackground/PlaceableBackground";
import Draggable from "@/components/commons/Draggable/Draggable";
import Extendable from "@/components/commons/Extendable/Extendable";
import ImageCropper from "@/components/commons/ImageCropper/ImageCropper";
import XYResizable from "@/components/commons/Resizable/XYResizable";
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
    resizable: 100,
    extendable: 125,
  },
  editButtons: 200,
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
  const [currentResizedWidgetInfo, setCurrentResizedWidgetInfo] = useState<{
    width: number;
    height: number;
    index: number;
  }>({ width: 0, height: 0, index: -1 });
  const [uploadImageDialogOpen, setUploadImageDialogOpen] =
    useState<boolean>(false);
  const [imageCropperDialogOpen, setImageCropperDialogOpen] =
    useState<boolean>(false);
  const [createWidgetDialogOpen, setCreateWidgetDialogOpen] =
    useState<boolean>(false);
  const [createWidgetAtBottom, setCreateWidgetAtBottom] =
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
      if (createWidgetAtBottom) {
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
        widgetManager.append(
          toWidget(previewWidget, {
            leftFrameCount: 0,
            topFrameCount: availableTopFrameCount,
          })
        );
      } else {
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
              widget.position.leftFrameCount <
              previewWidget.size.widthFrameCount
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
      }
      setCreateWidgetDialogOpen(false);
      setCreateWidgetAtBottom(false);
    },
    [widgetManager, currentFramePosition, createWidgetAtBottom]
  );

  const handleWidgetOnResize = useCallback(
    (
      width: number,
      height: number,
      resizedWidget: Widget
    ): {
      size: { availableWidth: number; availableHeight: number };
      frameCount: { widthFrameCount: number; heightFrameCount: number };
    } => {
      let result: {
        size: { availableWidth: number; availableHeight: number };
        frameCount: {
          widthFrameCount: number;
          heightFrameCount: number;
        };
      } = {
        size: {
          availableWidth:
            resizedWidget.size.widthFrameCount * frameSize - frameGap,
          availableHeight:
            resizedWidget.size.heightFrameCount * frameSize - frameGap,
        },
        frameCount: {
          widthFrameCount: resizedWidget.size.widthFrameCount,
          heightFrameCount: resizedWidget.size.heightFrameCount,
        },
      };
      let resultDistance = Math.sqrt(
        Math.pow(result.size.availableWidth - width, 2) +
          Math.pow(result.size.availableHeight - height, 2)
      );

      for (const availableSize of resizedWidget.availableSizes) {
        const currentDistance = Math.sqrt(
          Math.pow(
            availableSize.widthFrameCount * frameSize - frameGap - width,
            2
          ) +
            Math.pow(
              availableSize.heightFrameCount * frameSize - frameGap - height,
              2
            )
        );
        if (currentDistance < resultDistance) {
          result = {
            size: {
              availableWidth:
                availableSize.widthFrameCount * frameSize - frameGap,
              availableHeight:
                availableSize.heightFrameCount * frameSize - frameGap,
            },
            frameCount: {
              widthFrameCount: availableSize.widthFrameCount,
              heightFrameCount: availableSize.heightFrameCount,
            },
          };
          resultDistance = currentDistance;
        }
      }

      return result;
    },
    [frameSize, frameGap]
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
          disabled: !isEditing,
          droppableProps: {
            type: DNDType.DraggableWidget,
            hover: (
              draggedItem: Widget,
              monitor: DropTargetMonitor
            ): { widthFrameCount: number; heightFrameCount: number } => {
              if (!monitor.canDrop())
                return { widthFrameCount: 0, heightFrameCount: 0 };
              return draggedItem.size;
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
            setCreateWidgetAtBottom(false);
            setCurrentFramePosition(position);
            setCreateWidgetDialogOpen(true);
          },
        }}
      >
        {widgetManager.widgets.map((widget, index) => (
          <Draggable // a draggable wrapper to locate the widget base on the correct position
            key={index}
            style={{
              left: widget.position.leftFrameCount * frameSize + frameGap,
              top: widget.position.topFrameCount * frameSize + frameGap,
              width:
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.width
                  : widget.size.widthFrameCount * frameSize - frameGap,
              height:
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.height
                  : widget.size.heightFrameCount * frameSize - frameGap,
              zIndex: DashboardElementZIndexes.widgets.draggable,
            }}
            className="absolute shadow rounded-lg bg-background/80"
            type={DNDType.DraggableWidget}
            item={widget}
            canDrag={isEditing}
          >
            <XYResizable
              style={{ zIndex: DashboardElementZIndexes.widgets.resizable }}
              width={
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.width
                  : widget.size.widthFrameCount * frameSize - frameGap
              }
              setWidth={(newWidth: number) =>
                setCurrentResizedWidgetInfo(prev => ({
                  ...prev,
                  width: newWidth,
                }))
              }
              minWidth={widget.minSize.widthFrameCount * frameSize - frameGap}
              minHeight={widget.minSize.heightFrameCount * frameSize - frameGap}
              maxWidth={widget.maxSize.widthFrameCount * frameSize - frameGap}
              maxHeight={widget.maxSize.heightFrameCount * frameSize - frameGap}
              height={
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.height
                  : widget.size.heightFrameCount * frameSize - frameGap
              }
              setHeight={(newHeight: number) =>
                setCurrentResizedWidgetInfo(prev => ({
                  ...prev,
                  height: newHeight,
                }))
              }
              onBeforeResize={() =>
                setCurrentResizedWidgetInfo({
                  width: widget.size.widthFrameCount * frameSize - frameGap,
                  height: widget.size.heightFrameCount * frameSize - frameGap,
                  index: index,
                })
              }
              onResize={(
                width: number,
                height: number
              ): { availableWidth: number; availableHeight: number } =>
                handleWidgetOnResize(width, height, widget).size
              }
              onAfterResize={(width: number, height: number) => {
                const resizedFrameCount = handleWidgetOnResize(
                  width,
                  height,
                  widget
                ).frameCount;
                console.log("after: ", width, height, resizedFrameCount);
                widgetManager.update(index, "size", resizedFrameCount);
                setCurrentResizedWidgetInfo({ width: 0, height: 0, index: -1 });
              }}
              size={2.5}
              disabled={!isEditing}
              hasParent
            >
              <Extendable
                className="!top-1 !left-1 w-4 h-4 !bg-transparent"
                style={{ zIndex: DashboardElementZIndexes.widgets.extendable }}
                size={24}
                disabled={!isEditing}
                optionMenuItems={
                  <>
                    <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => widgetManager.remove(index)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                }
                hasParent
              >
                <widget.component
                  style={{
                    width: widget.size.widthFrameCount * frameSize - frameGap,
                    height: widget.size.heightFrameCount * frameSize - frameGap,
                  }}
                  className="bg-background/80 border-1 border-foreground/20 rounded-lg"
                />
              </Extendable>
            </XYResizable>
          </Draggable>
        ))}
        <div
          className="fixed right-4 bottom-4 flex justify-center items-center gap-2"
          style={{ zIndex: DashboardElementZIndexes.editButtons }}
        >
          {isEditing && (
            <Button
              variant="secondary"
              className="
                flex justify-center items-center
                border-1 border-foreground/30 rounded-full shadow-lg w-10 h-10 
                transition
              "
              onClick={() => {
                setCreateWidgetAtBottom(true);
                setCreateWidgetDialogOpen(true);
              }}
            >
              <PlusIcon />
            </Button>
          )}
          <Button
            variant="secondary"
            className="
                flex justify-center items-center
                border-1 border-foreground/30 rounded-full shadow-lg w-10 h-10 
                transition
              "
            onClick={() => {
              if (isEditing) {
                widgetManager.sync();
              }
              setIsEditing(prev => !prev);
            }}
          >
            {isEditing ? <CheckIcon size={18} /> : <EditIcon size={18} />}
          </Button>
        </div>
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
