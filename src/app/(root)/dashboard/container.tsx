"use client";

import GridBackground from "@/components/backgrounds/GridBackground/GridBackground";
import PlaceableBackground from "@/components/backgrounds/PlaceableBackground/PlaceableBackground";
import { ProgressiveBackground } from "@/components/backgrounds/ProgressiveBackground/ProgressiveBackground";
import Draggable from "@/components/commons/Draggable/Draggable";
import Extendable from "@/components/commons/Extendable/Extendable";
import ImageCropper from "@/components/commons/ImageCropper/ImageCropper";
import XYResizable from "@/components/commons/Resizable/XYResizable";
import CreateWidgetDialog from "@/components/dialogs/WidgetDialog/CreateWidgetDialog";
import ModifyImageHover from "@/components/hovers/ModifyImageHover/ModifyImageHover";
import CheckIcon from "@/components/icons/CheckIcon";
import EditIcon from "@/components/icons/EditIcon";
import PlusIcon from "@/components/icons/PlusIcon";
import WrenchIcon from "@/components/icons/WrenchIcon";
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
import { useDebounceValue, useLanguage, useTheme } from "@/hooks";
import { useBackgroundImages } from "@/hooks/useBackgroundImages";
import { useModal } from "@/hooks/useModal";
import { useScreen } from "@/hooks/useScreen";
import { useWidget } from "@/hooks/useWidget";
import { DNDType } from "@shared/enums";
import { IndexedDBManipulator } from "@shared/lib/indexedDBManipulator";
import { FrameCountPosition, FrameCountSize } from "@shared/types/cord";
import { ImageInfo } from "@shared/types/imageInfo.type";
import { IndexedDBKey } from "@shared/types/indexedDB.type";
import { UUID } from "crypto";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  const modalManager = useModal();
  const backgroundImagesManager = useBackgroundImages();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingWidgetIndex, setEditingWidgetIndex] = useState<number>(-1);
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
  const [cropImageDialogOpen, setCropImageDialogOpen] =
    useState<boolean>(false);
  const [createWidgetDialogOpen, setCreateWidgetDialogOpen] =
    useState<boolean>(false);
  const [createWidgetAtBottom, setCreateWidgetAtBottom] =
    useState<boolean>(false);

  const headerBackgroundImageRef = useRef<HTMLDivElement>(null);

  const { widthTotalFrameCount, heightTotalFrameCount, frameGap } =
    useDebounceValue(
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
        widgetManager.getWidgets().forEach(widget => {
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
      }, [screenManager.breakpoint, widgetManager]),
      500
    );

  const hasSomeWidgetsOutOfBoundary = useMemo(
    () =>
      widgetManager
        .getWidgets()
        .some(
          widget =>
            widget.position.leftFrameCount + widget.size.widthFrameCount >
            widthTotalFrameCount
        ),
    [widthTotalFrameCount]
  );

  useLayoutEffect(() => {
    if (headerBackgroundImageRef.current !== null) {
      const { width, height } =
        headerBackgroundImageRef.current.getBoundingClientRect();
      if (width && height) setCropperAspectRatio(width / height);
    }
  }, [backgroundImagesManager.currentBackgroundImageId]);

  const handleCreateWidgetOnClick = useCallback(
    (previewWidget: PreviewWidget) => {
      if (createWidgetAtBottom) {
        let availableTopFrameCount = 0;
        widgetManager.getWidgets().forEach(widget => {
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
          widgetManager.getWidgets().forEach(widget => {
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

  const isWidgetConflicted = useCallback(
    (
      widget: Widget,
      widthFrameCount?: number,
      heightFrameCount?: number
    ): boolean => {
      const widgetWidthFrameCount =
        widthFrameCount === undefined
          ? widget.size.widthFrameCount
          : widthFrameCount;
      const widgetHeightFrameCount =
        heightFrameCount === undefined
          ? widget.size.heightFrameCount
          : heightFrameCount;

      return widgetManager.getWidgets().some(potentialConflictableWidget => {
        if (potentialConflictableWidget.id === widget.id) return false;

        if (
          (potentialConflictableWidget.position.leftFrameCount >=
            widget.position.leftFrameCount &&
            potentialConflictableWidget.position.leftFrameCount <
              widget.position.leftFrameCount + widgetWidthFrameCount) ||
          (potentialConflictableWidget.position.leftFrameCount +
            potentialConflictableWidget.size.widthFrameCount >
            widget.position.leftFrameCount &&
            potentialConflictableWidget.position.leftFrameCount +
              potentialConflictableWidget.size.widthFrameCount <=
              widget.position.leftFrameCount + widgetWidthFrameCount)
        ) {
          if (
            (widget.position.topFrameCount >=
              potentialConflictableWidget.position.topFrameCount &&
              widget.position.topFrameCount <
                potentialConflictableWidget.position.topFrameCount +
                  potentialConflictableWidget.size.heightFrameCount) ||
            (widget.position.topFrameCount + widgetHeightFrameCount >
              potentialConflictableWidget.position.topFrameCount &&
              widget.position.topFrameCount + widgetHeightFrameCount <=
                potentialConflictableWidget.position.topFrameCount +
                  potentialConflictableWidget.size.heightFrameCount)
          ) {
            return true;
          }
        }

        return (
          // (prettier-ignore) check if some of the potential conflictable widgets containing the widget
          // (prettier-ignore) if the right bottom point of the widget is less than some of the other widgets
          (widget.position.leftFrameCount + widgetWidthFrameCount >=
            potentialConflictableWidget.position.leftFrameCount +
              potentialConflictableWidget.size.widthFrameCount &&
            widget.position.topFrameCount + widgetHeightFrameCount >=
              potentialConflictableWidget.position.topFrameCount +
                potentialConflictableWidget.size.heightFrameCount &&
            // (prettier-ignore) and if the left top point of the widget is greater than some other widgets
            widget.position.leftFrameCount <=
              potentialConflictableWidget.position.leftFrameCount &&
            widget.position.topFrameCount <=
              potentialConflictableWidget.position.topFrameCount) || // (prettier-ignore) check if the widget is containing in some of the potential conflictable widgets
          // (prettier-ignore) if the right bottom points of some other widgets are less than the widget
          (potentialConflictableWidget.position.leftFrameCount +
            potentialConflictableWidget.size.widthFrameCount >=
            widget.position.leftFrameCount + widgetWidthFrameCount &&
            potentialConflictableWidget.position.topFrameCount +
              potentialConflictableWidget.size.heightFrameCount >=
              // (prettier-ignore) and if the left top points of some other widgets are greater than the widget
              widget.position.topFrameCount + widgetHeightFrameCount &&
            potentialConflictableWidget.position.leftFrameCount <=
              widget.position.leftFrameCount &&
            potentialConflictableWidget.position.topFrameCount <=
              widget.position.topFrameCount)
        );
      });
    },
    [widgetManager]
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
          !isWidgetConflicted(
            resizedWidget,
            availableSize.widthFrameCount,
            availableSize.heightFrameCount
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
    [widgetManager, frameSize, frameGap]
  );

  const handleReorderWidgetsToFitInBoundary = useCallback(() => {
    const sortedWidgets = widgetManager
      .getWidgets()
      .sort((a: Widget, b: Widget) =>
        a.position.topFrameCount === b.position.topFrameCount
          ? a.position.leftFrameCount - b.position.leftFrameCount
          : a.position.topFrameCount - b.position.topFrameCount
      );
    let currentLeftFrameCount = 0,
      currentTopFrameCount = 0;
    const isOccupied: (UUID | undefined)[][] = Array.from(
      { length: heightTotalFrameCount },
      () => Array(widthTotalFrameCount).fill(undefined)
    );
    const placedWidgets = new Map<UUID, Widget>();
    const orderedWidgets: Widget[] = [];

    sortedWidgets.forEach(widget => {
      if (
        currentLeftFrameCount + widget.size.widthFrameCount >
          widthTotalFrameCount ||
        isOccupied[currentTopFrameCount]?.[currentLeftFrameCount] !== undefined
      ) {
        let reservedTopFrameCount = currentTopFrameCount + 1;
        for (let j = 0; j < widget.size.widthFrameCount; j++) {
          const occupyingId = isOccupied[currentTopFrameCount]?.[j];
          if (occupyingId === undefined) continue;

          const placedWidget = placedWidgets.get(occupyingId as UUID);
          if (placedWidget === undefined) continue;

          reservedTopFrameCount = Math.max(
            reservedTopFrameCount,
            placedWidget.position.topFrameCount +
              placedWidget.size.heightFrameCount
          );
        }
        currentTopFrameCount = reservedTopFrameCount;
        currentLeftFrameCount = 0;
      }
      const orderedWidget: Widget = {
        ...widget,
        position: {
          leftFrameCount: currentLeftFrameCount,
          topFrameCount: currentTopFrameCount,
        },
      };

      for (
        let i = currentTopFrameCount;
        i < currentTopFrameCount + widget.size.heightFrameCount;
        i++
      ) {
        if (!isOccupied[i]) {
          isOccupied[i] = Array(widthTotalFrameCount).fill(undefined);
        }
        for (
          let j = currentLeftFrameCount;
          j < currentLeftFrameCount + widget.size.widthFrameCount;
          j++
        ) {
          isOccupied[i][j] = widget.id;
        }
      }

      currentLeftFrameCount += widget.size.widthFrameCount;
      placedWidgets.set(widget.id, orderedWidget);
      orderedWidgets.push(orderedWidget);
    });

    widgetManager.sync(orderedWidgets);
  }, [widgetManager, widthTotalFrameCount, heightTotalFrameCount]);

  return (
    <div
      className="
        relative w-full h-full min-h-[calc(100vh-4rem)] overflow-hidden
        flex-col justify-center items-center
      "
    >
      <CreateWidgetDialog
        open={createWidgetDialogOpen}
        onOpenChange={setCreateWidgetDialogOpen}
        onCreate={handleCreateWidgetOnClick}
      />
      {backgroundImagesManager.currentBackgroundImageId === null ? (
        <GridBackground
          className={`!w-full !min-h-[240] !max-h-[300] relative z-${DashboardElementZIndexes.headerBackgroundImage}`}
        >
          {isEditing && (
            <ModifyImageHover
              className="absolute"
              imageSrc=""
              imageAlt="Dashboard background image"
              onClick={() =>
                modalManager.open("SelectBackgroundImageDialog", {
                  cropperAspectRatio: cropperAspectRatio,
                })
              }
              hoverText="點擊以變更背景圖片"
            />
          )}
        </GridBackground>
      ) : (
        <ProgressiveBackground
          ref={headerBackgroundImageRef}
          className={`w-full min-h-[240] max-h-[300] border-none relative z-${DashboardElementZIndexes.headerBackgroundImage}`}
        >
          {isEditing && (
            <ModifyImageHover
              className="absolute inset-0"
              imageAlt="Dashboard background image"
              onClick={() =>
                modalManager.open("SelectBackgroundImageDialog", {
                  cropperAspectRatio: cropperAspectRatio,
                })
              }
              hoverText="點擊以變更背景圖片"
            />
          )}
        </ProgressiveBackground>
      )}
      <PlaceableBackground
        className="overflow-x-hidden overflow-y-auto relative bg-background top-[-12] border-1 border-foreground/30 rounded-t-lg"
        // height: (heightTotalFrameCount + 「 2 」) * frameSize => remain 2 for extra spaces at the bottom area
        style={{ height: (heightTotalFrameCount + 2) * frameSize }}
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
                // make sure we return the size of the current widget from widgetManager.widgets
                widgetManager
                  .getWidgets()
                  .find(widget => widget.id === draggedItem.id)?.size ??
                draggedItem.size
              );
            },
            canDrop: (
              draggedItem: Widget,
              _: DropTargetMonitor,
              position: FrameCountPosition
            ) => {
              // make sure we get the current widget from widgetManager.widgets
              const draggedWidget = widgetManager
                .getWidgets()
                .find(widget => widget.id === draggedItem.id);
              if (draggedWidget === undefined) return false;
              draggedWidget.position = position;
              return !isWidgetConflicted(draggedWidget);
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
        {widgetManager.getWidgets().map((widget, index) => (
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
            className="absolute shadow rounded-lg bg-transparent"
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
              ): { availableWidth: number; availableHeight: number } => {
                const resizedWidget = widgetManager
                  .getWidgets()
                  .find(currentWidget => currentWidget.id === widget.id); // make sure we get the current widget from the widgetManager.widgets
                if (resizedWidget === undefined) {
                  return {
                    availableWidth: 0,
                    availableHeight: 0,
                  };
                }
                return handleWidgetOnResize(width, height, resizedWidget).size;
              }}
              onAfterResize={(width: number, height: number) => {
                const resizedWidget = widgetManager
                  .getWidgets()
                  .find(currentWidget => currentWidget.id === widget.id); // make sure we get the current widget from the widgetManager.widgets
                if (resizedWidget === undefined) return;
                const resizedFrameCount = handleWidgetOnResize(
                  width,
                  height,
                  resizedWidget
                ).frameCount;
                widgetManager.update(index, "size", resizedFrameCount);
                setCurrentResizedWidgetInfo({ width: 0, height: 0, index: -1 });
              }}
              size={2.5}
              disabled={!isEditing}
              hasParent
            >
              <Extendable
                className="w-4 h-4 !top-2 !right-2 !bg-transparent"
                style={{ zIndex: DashboardElementZIndexes.widgets.extendable }}
                size={24}
                disabled={!isEditing}
                optionMenuItems={
                  <>
                    {widget.isEditable && (
                      <DropdownMenuItem
                        onClick={() => setEditingWidgetIndex(index)}
                      >
                        Edit
                      </DropdownMenuItem>
                    )}
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
                  className="
                    w-full h-full 
                    bg-card border-[1.5] border-foreground/25 rounded-lg
                    transition-all duration-200 ease-in-out
                  "
                  isWidgetEditing={isEditing && editingWidgetIndex === index}
                  onIsWidgetEditingChange={(prevIsWidgetEditing: boolean) =>
                    setEditingWidgetIndex(prevIsWidgetEditing ? index : -1)
                  }
                  setting={widget.setting}
                  setSetting={(newSetting: any) =>
                    widgetManager.update(index, "setting", newSetting)
                  }
                  data={widget.data}
                  setData={(newData: any) =>
                    widgetManager.update(index, "data", newData)
                  }
                  sync={widgetManager.sync}
                />
              </Extendable>
            </XYResizable>
          </Draggable>
        ))}
        <div
          className="fixed right-4 bottom-4 flex justify-center items-center gap-2"
          style={{ zIndex: DashboardElementZIndexes.editButtons }}
        >
          {hasSomeWidgetsOutOfBoundary && (
            <Button
              variant="secondary"
              className="
                flex justify-center items-center
                border-1 border-foreground/30 rounded-full shadow-lg w-10 h-10 
                transition
              "
              onClick={handleReorderWidgetsToFitInBoundary}
            >
              <WrenchIcon />
            </Button>
          )}
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
      {uploadHeaderBackgroundImageURL !== null && (
        <Dialog
          open={cropImageDialogOpen}
          onOpenChange={setCropImageDialogOpen}
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
                  )) ?? { header: { totalSize: 0 }, contents: [] };

                const lastImage =
                  imageInfo.contents[imageInfo.contents.length - 1];
                const url = URL.createObjectURL(lastImage.file);
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
                imageInfo.header.totalSize = imageInfo.contents.reduce(
                  (sum, img) => sum + (img.file?.size ?? 0),
                  0
                );
                await IndexedDBManipulator.setItem(
                  IndexedDBKey.backgroundImages,
                  imageInfo
                );
                setCropImageDialogOpen(false);
              }}
              onCancel={() => setCropImageDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardContainer;
