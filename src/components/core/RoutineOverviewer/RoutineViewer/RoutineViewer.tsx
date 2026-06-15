import type { UUID } from "crypto";
import { Suspense, useEffect } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useRoutine } from "@/hooks";
import RoutineOverviewerContent from "../RoutineOverviewerContent";

interface RoutineViewerProps {
  stationId: UUID;
}

const RoutineViewer = ({ stationId }: RoutineViewerProps) => {
  const routineManager = useRoutine();

  useEffect(() => {
    routineManager.setViewMode("station");
    routineManager.setActiveStationId(stationId);

    return () => {
      routineManager.setViewMode("overview");
      routineManager.setActiveStationId(null);
    };
  }, [stationId]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <RoutineOverviewerContent />
    </Suspense>
  );
};

export default RoutineViewer;
