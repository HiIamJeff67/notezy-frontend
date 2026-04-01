import ClockWidget from "@/components/widgets/ClockWidget/ClockWidget";
import TodoWidget from "@/components/widgets/TodoWidget/TodoWidget";
import {
  FrameCountPosition,
  FrameCountSize,
  Position,
  Size,
} from "@shared/types/cord";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";
import CalendarWidget from "./CalendarWidget/CalendarWidget";

export type Widget = {
  id: UUID;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  position: FrameCountPosition;
  size: FrameCountSize;
  minSize: FrameCountSize;
  maxSize: FrameCountSize;
  // The attribute of `availableSizes` should be sorted
  // (related to the distance of { widthFrameCount: 0, heightFrameCount: 0 })
  // in ascending order by default
  availableSizes: FrameCountSize[];
};

export type PreviewWidget = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  size: FrameCountSize;
  minSize: FrameCountSize;
  maxSize: FrameCountSize;
  availableSizes: FrameCountSize[];
};

export const toWidget = (
  previewWidget: PreviewWidget,
  position: FrameCountPosition,
  id: UUID = generateUUID()
): Widget => {
  return {
    ...previewWidget,
    id: id,
    position: position,
  } as Widget;
};

export const getPositionValue = (
  frameCount: number,
  frameSize: number,
  frameGap: number
) => {
  return frameCount * frameSize + frameGap;
};

export const getPositionValues = (
  position: FrameCountPosition,
  frameSize: number,
  frameGap: number
): Position => {
  return {
    left: getPositionValue(position.leftFrameCount, frameSize, frameGap),
    top: getPositionValue(position.topFrameCount, frameSize, frameGap),
  };
};

export const getSizeValue = (
  frameCount: number,
  frameSize: number,
  frameGap: number
) => {
  return frameCount * frameSize - frameGap;
};

export const getSizeValues = (
  size: FrameCountSize,
  frameSize: number,
  frameGap: number
): Size => {
  return {
    width: getSizeValue(size.widthFrameCount, frameSize, frameGap),
    height: getSizeValue(size.heightFrameCount, frameSize, frameGap),
  };
};

export const BasicPreviewWidgets: Record<string, PreviewWidget> = {
  clock: {
    name: "clock",
    description: "A simple clock",
    component: ClockWidget,
    size: {
      widthFrameCount: 1,
      heightFrameCount: 1,
    },
    minSize: {
      widthFrameCount: 1,
      heightFrameCount: 1,
    },
    maxSize: {
      widthFrameCount: 2,
      heightFrameCount: 2,
    },
    availableSizes: [
      { widthFrameCount: 1, heightFrameCount: 1 },
      { widthFrameCount: 2, heightFrameCount: 2 },
    ],
  },
  todo: {
    name: "todo",
    description: "A simple todo list",
    component: TodoWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    maxSize: {
      widthFrameCount: 4,
      heightFrameCount: 6,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 2, heightFrameCount: 4 },
      { widthFrameCount: 2, heightFrameCount: 5 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 3, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 6 },
    ],
  },
  calendar: {
    name: "calendar",
    description: "A simple calendar support marking selected days",
    component: CalendarWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
    maxSize: {
      widthFrameCount: 3,
      heightFrameCount: 4,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
    ],
  },
};

export const AccountPreviewWidgets: Record<string, PreviewWidget> = {};
