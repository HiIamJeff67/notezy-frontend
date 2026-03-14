import ClockWidget from "./clock-widget";
import TodoWidget from "./todo-widget";

export type WidgetRegistryProps = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  widthOptions: number[];
  heightOptions: number[];
  availableAspects: Set<string>;
};

export const BasicWidgetRegistries: Record<string, WidgetRegistryProps> = {
  clock: {
    name: "Clock",
    description: "A simple clock",
    component: ClockWidget,
    widthOptions: [100],
    heightOptions: [100],
    availableAspects: new Set(["100|100", "200|200"]),
  },
  todo: {
    name: "Todo",
    description: "A simple todo list",
    component: TodoWidget,
    widthOptions: [100],
    heightOptions: [100],
    availableAspects: new Set(["100|150", "100|200", "150|200"]),
  },
};
