import ClockWidget from "@/components/widgets/ClockWidget/ClockWidget";
import TodoWidget from "@/components/widgets/TodoWidget/TodoWidget";

export type Widget = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  leftFrameCount: number;
  topFrameCount: number;
  widthFrameCount: number;
  heightFrameCount: number;
};

export type PreviewWidget = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  widthFrameCount: number;
  heightFrameCount: number;
};

export const toWidget = (
  previewWidget: PreviewWidget,
  leftFrameCount: number,
  topFrameCount: number
): Widget => {
  return {
    ...previewWidget,
    leftFrameCount: leftFrameCount,
    topFrameCount: topFrameCount,
  } as Widget;
};

export const BasicPreviewWidgets: Record<string, PreviewWidget> = {
  clock: {
    name: "clock",
    description: "A simple clock",
    component: ClockWidget,
    widthFrameCount: 1,
    heightFrameCount: 1,
  },
  todo: {
    name: "todo",
    description: "A simple todo list",
    component: TodoWidget,
    widthFrameCount: 2,
    heightFrameCount: 3,
  },
};
