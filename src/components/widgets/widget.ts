import ClockWidget from "@/components/widgets/ClockWidget/ClockWidget";
import TodoWidget from "@/components/widgets/TodoWidget/TodoWidget";

export type Widget = {
  name: string;
  description: string;
  component: React.ComponentType<any>;
  currentAspect: string;
};

export const BasicWidgets: Record<string, Widget> = {
  clock: {
    name: "clock",
    description: "A simple clock",
    component: ClockWidget,
    currentAspect: "col-span-2 aspect-[1/1]",
  },
  todo: {
    name: "todo",
    description: "A simple todo list",
    component: TodoWidget,
    currentAspect: "col-span-4 aspect-[1/1]",
  },
};
