import type { UUID } from "crypto";
import RoutineViewer from "@/components/core/RoutineOverviewer/RoutineViewer/RoutineViewer";

interface StationRoutinesPageProps {
  stationId: UUID;
}

const StationRoutinesPage = ({ stationId }: StationRoutinesPageProps) => {
  return <RoutineViewer stationId={stationId} />;
};

export default StationRoutinesPage;
