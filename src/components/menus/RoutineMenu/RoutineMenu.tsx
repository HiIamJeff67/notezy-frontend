import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { Suspense } from "react";
import RoutineItemMenu from "@/components/menus/RoutineMenu/RoutineItemMenu";
import RoutineItemMenuSkeleton from "@/components/menus/RoutineMenu/RoutineItemMenuSkeleton";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import { useRoutine } from "@/hooks";

interface RoutineMenuProps {
  routines: RoutineNode[];
  station?: StationNode;
}

const RoutineMenu = ({ routines, station }: RoutineMenuProps) => {
  const routineManager = useRoutine();

  return (
    <SidebarMenuSub>
      <Suspense fallback={<RoutineItemMenuSkeleton />}>
        {routines.map(routine => {
          const currentStation =
            station ?? routineManager.getStationById(routine.stationId);
          if (!currentStation) return null;

          return (
            <Suspense fallback={<RoutineItemMenuSkeleton />} key={routine.id}>
              <RoutineItemMenu station={currentStation} routine={routine} />
            </Suspense>
          );
        })}
      </Suspense>
    </SidebarMenuSub>
  );
};

export default RoutineMenu;
