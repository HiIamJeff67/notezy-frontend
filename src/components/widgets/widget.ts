import ClockWidget from "@/components/widgets/ClockWidget/ClockWidget";
import TodoWidget from "@/components/widgets/TodoWidget/TodoWidget";
import { generateUUID } from "@shared/types/uuidv4.type";
import { UUID } from "crypto";
import CalendarWidget from "./CalendarWidget/CalendarWidget";

export type Widget = {
  id: UUID;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  position: {
    leftFrameCount: number;
    topFrameCount: number;
  };
  size: {
    widthFrameCount: number;
    heightFrameCount: number;
  };
};

export type PreviewWidget = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  size: {
    widthFrameCount: number;
    heightFrameCount: number;
  };
};

export const toWidget = (
  previewWidget: PreviewWidget,
  position: {
    leftFrameCount: number;
    topFrameCount: number;
  },
  id: UUID = generateUUID()
): Widget => {
  return {
    ...previewWidget,
    id: id,
    position: position,
  } as Widget;
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
  },
  todo: {
    name: "todo",
    description: "A simple todo list",
    component: TodoWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
  },
  calendar: {
    name: "calendar",
    description: "A simple calendar support marking selected days",
    component: CalendarWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 3,
    },
  },
};

export const AccountPreviewWidgets: Record<string, PreviewWidget> = {};
