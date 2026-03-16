import ClockWidget from "./clock-widget";
import TodoWidget from "./todo-widget";

export type Widget = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  currentAspect: string;
  availableAspects: Set<string>;
};

export const BasicWidgets: Record<string, Widget> = {
  clock: {
    name: "clock",
    description: "A simple clock",
    component: ClockWidget,
    currentAspect: "col-span-2 aspect-[1/1]",
    availableAspects: new Set([
      "col-span-2 aspect-[1/1]",
      "col-span-3 aspect-[1/1]",
    ]),
  },
  todo: {
    name: "todo",
    description: "A simple todo list",
    component: TodoWidget,
    currentAspect: "col-span-3 aspect-[4/3]",
    availableAspects: new Set([
      "col-span-3 aspect-[1/1]",
      "col-span-4 aspect-[1/1]",
      "col-span-4 aspect-[4/3]",
      "col-span-6 aspect-[16/9]",
      "col-span-2 aspect-[3/4]",
      "col-span-6 aspect-[2/1]",
    ]),
  },
};
