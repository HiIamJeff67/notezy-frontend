import { useStationRoutine } from "@/hooks";
import RoutineInspector from "./RoutineInspector";
import RoutineTagInspector from "./RoutineTagInspector";
import RoutineTaskInspector from "./RoutineTaskInspector";
import StationInspector from "./StationInspector";

const StationRoutineInspectorHost = () => {
  const stationRoutineManager = useStationRoutine();

  if (stationRoutineManager.inspectorTarget === null) return null;

  if (stationRoutineManager.inspectorTarget.type === "station") {
    return (
      <StationInspector
        stationId={stationRoutineManager.inspectorTarget.id}
        isOpen
        onClose={stationRoutineManager.closeInspector}
      />
    );
  }

  if (stationRoutineManager.inspectorTarget.type === "routine") {
    return (
      <RoutineInspector
        routineId={stationRoutineManager.inspectorTarget.id}
        isOpen
        onClose={stationRoutineManager.closeInspector}
      />
    );
  }

  if (stationRoutineManager.inspectorTarget.type === "routineTag") {
    return (
      <RoutineTagInspector
        routineTagId={stationRoutineManager.inspectorTarget.id}
        isOpen
        onClose={stationRoutineManager.closeInspector}
      />
    );
  }

  return (
    <RoutineTaskInspector
      routineTaskId={stationRoutineManager.inspectorTarget.id}
      isOpen
      onClose={stationRoutineManager.closeInspector}
    />
  );
};

export default StationRoutineInspectorHost;
