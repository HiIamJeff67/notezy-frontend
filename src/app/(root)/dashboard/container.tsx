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
import {
  getPositionValue,
  getSizeValue,
  PreviewWidget,
  toWidget,
  Widget,
} from "@/components/widgets/widget";
import { useLanguage, useTheme } from "@/hooks";
import { useScreen } from "@/hooks/useScreen";
import { useWidget } from "@/hooks/useWidget";
import { DNDType } from "@shared/enums";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { FrameCountPosition, FrameCountSize } from "@shared/types/cord";
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
  const [editingWidgetIndex, setEditingWidgetIndex] = useState<number>(-1);
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
  const widgetsRef = useRef<Widget[]>(widgetManager.widgets);

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
    widgetsRef.current = widgetManager.widgets;
  }, [widgetManager.widgets]);

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [headerBackgroundImageURL]);

  const handleBackgroundImagesOnUpload = useCallback(async (files: File[]) => {
    const imageInfo: ImageInfo = (await IndexedDBManipulator.getItemByKey(
      IndexedDBKey.backgroundImages
    )) ?? {
      header: { totalSize: 0 },
      content: [],
    };
    const url = URL.createObjectURL(files[files.length - 1]);
    const image = new Image();
    image.src = url;
    image.onload = () => setCropperAspectRatio(image.width / image.height);
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
  }, []);

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
        const createdFramePosition: FrameCountPosition = currentFramePosition;
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
      frameCount: FrameCountSize;
    } => {
      const compatibleSizes: FrameCountSize[] = []; // the non conflicted widgets

      // Pass 1: Eliminate the available sizes which may cause a conflict to other widgets
      resizedWidget.availableSizes.forEach(availableSize => {
        if (
          !widgetsRef.current.some(
            potentialConflictableWidget =>
              potentialConflictableWidget.id != resizedWidget.id &&
              // if the right border of the current resized widget is between the left border and the right border of some other widgets
              getPositionValue(
                resizedWidget.position.leftFrameCount,
                frameSize,
                frameGap
              ) +
                width >=
                getPositionValue(
                  potentialConflictableWidget.position.leftFrameCount,
                  frameSize,
                  frameGap
                ) &&
              getPositionValue(
                resizedWidget.position.leftFrameCount,
                frameSize,
                frameGap
              ) +
                width <=
                getPositionValue(
                  potentialConflictableWidget.position.leftFrameCount,
                  frameSize,
                  frameGap
                ) +
                  getSizeValue(
                    potentialConflictableWidget.size.widthFrameCount,
                    frameSize,
                    frameGap
                  ) &&
              // if the bottom border of the current resized widget is between the left border and the right border of some other widgets
              getPositionValue(
                resizedWidget.position.topFrameCount,
                frameSize,
                frameGap
              ) +
                height >=
                getPositionValue(
                  potentialConflictableWidget.position.topFrameCount,
                  frameSize,
                  frameGap
                ) &&
              getPositionValue(
                resizedWidget.position.topFrameCount,
                frameSize,
                frameGap
              ) +
                height <=
                getPositionValue(
                  potentialConflictableWidget.position.topFrameCount,
                  frameSize,
                  frameGap
                ) +
                  getSizeValue(
                    potentialConflictableWidget.size.heightFrameCount,
                    frameSize,
                    frameGap
                  )
          )
        ) {
          // we check the right and the bottom border to handle the resize of the expansion on the right and the bottom border
          // we don't need check the left and top border, since if the resized widget is shrinking, it will not be smaller than its smallest size
          compatibleSizes.push(availableSize);
        }
      });

      // Pass 2: Find the closest available sizes when there're no available sizes which will cause the conflict
      let result: {
        size: { availableWidth: number; availableHeight: number };
        frameCount: FrameCountSize;
      } = {
        size: {
          availableWidth: getSizeValue(
            resizedWidget.size.widthFrameCount,
            frameSize,
            frameGap
          ),
          availableHeight: getSizeValue(
            resizedWidget.size.heightFrameCount,
            frameSize,
            frameGap
          ),
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
      compatibleSizes.forEach(compatibleSize => {
        const currentDistance = Math.sqrt(
          Math.pow(
            getSizeValue(compatibleSize.widthFrameCount, frameSize, frameGap) -
              width,
            2
          ) +
            Math.pow(
              getSizeValue(
                compatibleSize.heightFrameCount,
                frameSize,
                frameGap
              ) - height,
              2
            )
        );
        if (currentDistance < resultDistance) {
          resultDistance = currentDistance;
          result = {
            size: {
              availableWidth: getSizeValue(
                compatibleSize.widthFrameCount,
                frameSize,
                frameGap
              ),
              availableHeight: getSizeValue(
                compatibleSize.heightFrameCount,
                frameSize,
                frameGap
              ),
            },
            frameCount: {
              widthFrameCount: compatibleSize.widthFrameCount,
              heightFrameCount: compatibleSize.heightFrameCount,
            },
          };
        }
      });

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
              return (
                widgetsRef.current.find(widget => widget.id === draggedItem.id)
                  ?.size ?? draggedItem.size
              );
            },
            canDrop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: FrameCountPosition
            ) => {
              return !widgetsRef.current.some(
                potentialConflictableWidget =>
                  potentialConflictableWidget.id != draggedItem.id &&
                  potentialConflictableWidget.position.leftFrameCount >=
                    position.leftFrameCount &&
                  potentialConflictableWidget.position.leftFrameCount +
                    potentialConflictableWidget.size.widthFrameCount <=
                    position.leftFrameCount +
                      draggedItem.size.widthFrameCount &&
                  potentialConflictableWidget.position.topFrameCount >=
                    position.topFrameCount &&
                  potentialConflictableWidget.position.topFrameCount +
                    potentialConflictableWidget.size.heightFrameCount <=
                    position.topFrameCount + draggedItem.size.heightFrameCount
              );
            },
            drop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: FrameCountPosition
            ) =>
              widgetManager.updateByWidget(draggedItem, "position", position),
          },
          onClick: (position: FrameCountPosition) => {
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
              left: getPositionValue(
                widget.position.leftFrameCount,
                frameSize,
                frameGap
              ),
              top: getPositionValue(
                widget.position.topFrameCount,
                frameSize,
                frameGap
              ),
              width:
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.width
                  : getSizeValue(
                      widget.size.widthFrameCount,
                      frameSize,
                      frameGap
                    ),
              height:
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.height
                  : getSizeValue(
                      widget.size.heightFrameCount,
                      frameSize,
                      frameGap
                    ),
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
                  : getSizeValue(
                      widget.size.widthFrameCount,
                      frameSize,
                      frameGap
                    )
              }
              setWidth={(newWidth: number) =>
                setCurrentResizedWidgetInfo(prev => ({
                  ...prev,
                  width: newWidth,
                }))
              }
              minWidth={getSizeValue(
                widget.minSize.widthFrameCount,
                frameSize,
                frameGap
              )}
              minHeight={getSizeValue(
                widget.minSize.heightFrameCount,
                frameSize,
                frameGap
              )}
              maxWidth={getSizeValue(
                widget.maxSize.widthFrameCount,
                frameSize,
                frameGap
              )}
              maxHeight={getSizeValue(
                widget.maxSize.heightFrameCount,
                frameSize,
                frameGap
              )}
              height={
                index === currentResizedWidgetInfo.index
                  ? currentResizedWidgetInfo.height
                  : getSizeValue(
                      widget.size.heightFrameCount,
                      frameSize,
                      frameGap
                    )
              }
              setHeight={(newHeight: number) =>
                setCurrentResizedWidgetInfo(prev => ({
                  ...prev,
                  height: newHeight,
                }))
              }
              onBeforeResize={() =>
                setCurrentResizedWidgetInfo({
                  width: getSizeValue(
                    widget.size.widthFrameCount,
                    frameSize,
                    frameGap
                  ),
                  height: getSizeValue(
                    widget.size.heightFrameCount,
                    frameSize,
                    frameGap
                  ),
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
                    <DropdownMenuItem
                      onClick={() => setEditingWidgetIndex(index)}
                    >
                      Edit
                    </DropdownMenuItem>
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
                    width: getSizeValue(
                      widget.size.widthFrameCount,
                      frameSize,
                      frameGap
                    ),
                    height: getSizeValue(
                      widget.size.heightFrameCount,
                      frameSize,
                      frameGap
                    ),
                  }}
                  className="bg-background/80 border-[1.5] border-foreground/25 rounded-lg"
                  isWidgetEditing={isEditing && editingWidgetIndex === index}
                  onIsWidgetEditingChange={(prevIsWidgetEditing: boolean) =>
                    setEditingWidgetIndex(prevIsWidgetEditing ? index : -1)
                  }
                />
              </Extendable>
            </XYResizable>
          </Draggable>
        ))}
        <div
          className="fixed right-4 bottom-4 flex justify-center items-center gap-2"
          style={{ zIndex: DashboardElementZIndexes.editButtons }}
        >
          {isEditing ? (
            <>
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
              <Button
                variant="secondary"
                className="
                flex justify-center items-center
                border-1 border-foreground/30 rounded-full shadow-lg w-10 h-10 
                transition
              "
                onClick={() => {
                  widgetManager.sync();
                  setIsEditing(false);
                }}
              >
                <CheckIcon size={18} />
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              className="
                flex justify-center items-center
                border-1 border-foreground/30 rounded-full shadow-lg w-10 h-10 
                transition
              "
              onClick={() => setIsEditing(true)}
            >
              <EditIcon size={18} />
            </Button>
          )}
        </div>
      </PlaceableBackground>
      <UploadImageDialog
        open={uploadImageDialogOpen}
        onOpenChange={setUploadImageDialogOpen}
        title="Upload Background Images"
        onUpload={handleBackgroundImagesOnUpload}
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
