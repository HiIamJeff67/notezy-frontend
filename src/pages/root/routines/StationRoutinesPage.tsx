import type { UUID } from "crypto";
import StationRoutineOverviewer from "@/components/core/RoutineOverviewer/StationRoutineOverviewer";

interface StationRoutinesPageProps {
  stationId: UUID;
}

const StationRoutinesPage = ({ stationId }: StationRoutinesPageProps) => {
  return <StationRoutineOverviewer stationId={stationId} />;
};

export default StationRoutinesPage;
