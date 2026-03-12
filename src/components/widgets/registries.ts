import ClockWidget from "./ClockWidget/ClockWidget";
import TodoWidget from "./TodoWidget/TodoWidget";

export type WidgetRegistryProps = {
  name: string;
  component: () => React.ReactNode;
  defaultWidth: string;
  defaultHeight: string;
};

export const BasicWidgetRegistry: Record<string, WidgetRegistryProps> = {
  clock: {
    name: "Clock",
    component: ClockWidget,
    defaultWidth: "col-span-4",
    defaultHeight: "h-32",
  },
  todo: {
    name: "Todo",
    component: TodoWidget,
    defaultWidth: "col-span-4",
    defaultHeight: "h-32",
  },
};
