import type { RoutineTaskNode } from "@shared/types/routineTaskNode.type";
import { Suspense } from "react";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import RoutineTaskMenuItem from "./RoutineTaskMenuItem";

interface RoutineTaskMenuProps {
  routineTasks: RoutineTaskNode[];
}

const RoutineTaskMenu = ({ routineTasks }: RoutineTaskMenuProps) => {
  return (
    <SidebarMenuSub>
      <Suspense fallback={null}>
        {[...routineTasks]
          .sort((leftRoutineTask, rightRoutineTask) =>
            leftRoutineTask.title.localeCompare(rightRoutineTask.title)
          )
          .map(routineTask => (
            <RoutineTaskMenuItem
              key={routineTask.id}
              routineTask={routineTask}
            />
          ))}
      </Suspense>
    </SidebarMenuSub>
  );
};

export default RoutineTaskMenu;
