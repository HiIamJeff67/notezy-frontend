import type { UUID } from "crypto";
import { Suspense, useEffect, useRef } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useRoutine } from "@/hooks";
import RoutineOverViewerContent from "./RoutineOverViewerContent";

interface StationRoutineOverviewerProps {
  stationId: UUID;
}

const StationRoutineOverviewer = ({
  stationId,
}: StationRoutineOverviewerProps) => {
  const routineManager = useRoutine();
  const previousScopeRef = useRef(routineManager.scope);

  useEffect(() => {
    routineManager.setViewMode("station");
    routineManager.setActiveStationId(stationId);
    routineManager.setStationScope([stationId]);

    return () => {
      routineManager.setViewMode("overview");
      routineManager.setActiveStationId(null);
      routineManager.setStationScope(previousScopeRef.current.stationIds);
      routineManager.setRoutineTagScope(previousScopeRef.current.routineTagIds);
    };
  }, [stationId]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverViewerContent />
    </Suspense>
  );
};

export default StationRoutineOverviewer;
