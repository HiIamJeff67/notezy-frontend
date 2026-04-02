import { PreviewWidget } from "../widget";
import CalendarWidget from "./CalendarWidget/CalendarWidget";
import ClockWidget from "./ClockWidget/ClockWidget";
import { ClockSetting } from "./ClockWidget/data/clockSettings";
import { ClockStyles } from "./ClockWidget/data/clockStyles";
import { TimeZones } from "./ClockWidget/data/timeZones";
import TodoWidget from "./TodoWidget/TodoWidget";

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
    defaultSetting: {
      selectedTimeZone: TimeZones[0],
      selectedClockStyle: ClockStyles[0],
      enableTimer: true,
      timerFontSize: 10,
      timerInterval: 1000,
      enableLocale: true,
      localeFontSize: 10,
    } as ClockSetting,
    defaultData: {},
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
    defaultSetting: {},
    defaultData: {},
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
    defaultSetting: {},
    defaultData: {},
  },
};
