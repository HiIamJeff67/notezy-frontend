import CalendarWidget from "@widgets/basic/CalendarWidget/CalendarWidget";
import ClockWidget from "@widgets/basic/ClockWidget/ClockWidget";
import { getDefaultClockSetting } from "@widgets/basic/ClockWidget/data/clockSettings";
import TodoWidget from "@widgets/basic/TodoWidget/TodoWidget";
import { PreviewWidget } from "@widgets/widget";
import { getDefaultScratchPadData } from "./ScratchPadWidget/data/scratchPadData";
import { getDefaultScratchPadSetting } from "./ScratchPadWidget/data/scratchPadSettings";
import ScratchPadWidget from "./ScratchPadWidget/ScratchPadWidget";
import { getDefaultTimerData } from "./TimerWidget/data/timerData";
import { getDefaultTimerSetting } from "./TimerWidget/data/timerSettings";
import TimerWidget from "./TimerWidget/TimerWidget";
import { getDefaultTodoData } from "./TodoWidget/data/todoData";
import { getDefaultTodoSetting } from "./TodoWidget/data/todoSettings";

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
    defaultSetting: getDefaultClockSetting(),
    defaultData: {},
    isEditable: true,
  },
  timer: {
    name: "timer",
    description: "A simple pomodoro timer",
    component: TimerWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 1,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 1,
    },
    maxSize: {
      widthFrameCount: 4,
      heightFrameCount: 4,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 1 },
      { widthFrameCount: 2, heightFrameCount: 2 },
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 2 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 6 },
    ],
    defaultSetting: getDefaultTimerSetting(),
    defaultData: getDefaultTimerData(),
    isEditable: true,
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
    defaultSetting: getDefaultTodoSetting(),
    defaultData: getDefaultTodoData(),
    isEditable: true,
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
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
    ],
    defaultSetting: {},
    defaultData: {},
    isEditable: false,
  },
  scratchPad: {
    name: "scratchPad",
    description: "A simple place to write any text using markdown",
    component: ScratchPadWidget,
    size: {
      widthFrameCount: 2,
      heightFrameCount: 2,
    },
    minSize: {
      widthFrameCount: 2,
      heightFrameCount: 2,
    },
    maxSize: {
      widthFrameCount: 4,
      heightFrameCount: 6,
    },
    availableSizes: [
      { widthFrameCount: 2, heightFrameCount: 2 },
      { widthFrameCount: 2, heightFrameCount: 3 },
      { widthFrameCount: 2, heightFrameCount: 4 },
      { widthFrameCount: 2, heightFrameCount: 5 },
      { widthFrameCount: 2, heightFrameCount: 6 },
      { widthFrameCount: 3, heightFrameCount: 3 },
      { widthFrameCount: 3, heightFrameCount: 4 },
      { widthFrameCount: 3, heightFrameCount: 5 },
      { widthFrameCount: 3, heightFrameCount: 6 },
      { widthFrameCount: 4, heightFrameCount: 4 },
      { widthFrameCount: 4, heightFrameCount: 5 },
      { widthFrameCount: 4, heightFrameCount: 6 },
    ],
    defaultSetting: getDefaultScratchPadSetting(),
    defaultData: getDefaultScratchPadData(),
    isEditable: true,
  },
};
