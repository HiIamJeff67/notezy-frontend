import { createFileRoute } from "@tanstack/react-router";
import type { UUID } from "crypto";
import StationRoutinesPage from "@/pages/root/routines/StationRoutinesPage";

export const Route = createFileRoute("/_root/routines/$stationId")({
  component: StationRoutinesRoute,
});

function StationRoutinesRoute() {
  const { stationId } = Route.useParams();
  return <StationRoutinesPage stationId={stationId as UUID} />;
}
