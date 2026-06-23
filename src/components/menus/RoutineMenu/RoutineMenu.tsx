import type { RoutineNode } from "@shared/types/routineNode.type";
import type { StationNode } from "@shared/types/stationNode.type";
import { Suspense } from "react";
import RoutineMenuItem from "@/components/menus/RoutineMenu/RoutineMenuItem";
import RoutineMenuItemSkeleton from "@/components/menus/RoutineMenu/RoutineMenuItemSkeleton";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import { useStationRoutine } from "@/hooks";

interface RoutineMenuProps {
  routines: RoutineNode[];
  station?: StationNode;
}

const RoutineMenu = ({ routines, station }: RoutineMenuProps) => {
  const stationRoutineManager = useStationRoutine();

  return (
    <SidebarMenuSub>
      <Suspense fallback={<RoutineMenuItemSkeleton />}>
        {[...routines]
          .sort((leftRoutine, rightRoutine) =>
            leftRoutine.title.localeCompare(rightRoutine.title)
          )
          .map(routine => {
            const currentStation =
              station ??
              stationRoutineManager.getStationById(routine.stationId);
            if (!currentStation) return null;

            return (
              <Suspense fallback={<RoutineMenuItemSkeleton />} key={routine.id}>
                <RoutineMenuItem station={currentStation} routine={routine} />
              </Suspense>
            );
          })}
      </Suspense>
    </SidebarMenuSub>
  );
};

export default RoutineMenu;
