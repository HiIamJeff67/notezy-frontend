import { useRoutine } from "@/hooks";
import RoutineInspector from "./RoutineInspector";
import RoutineTagInspector from "./RoutineTagInspector";
import RoutineTaskInspector from "./RoutineTaskInspector";
import StationInspector from "./StationInspector";

const StationRoutineInspectorHost = () => {
  const routineManager = useRoutine();

  if (routineManager.inspectorTarget === null) return null;

  if (routineManager.inspectorTarget.type === "station") {
    return (
      <StationInspector
        stationId={routineManager.inspectorTarget.id}
        isOpen
        onClose={routineManager.closeInspector}
      />
    );
  }

  if (routineManager.inspectorTarget.type === "routine") {
    return (
      <RoutineInspector
        routineId={routineManager.inspectorTarget.id}
        isOpen
        onClose={routineManager.closeInspector}
      />
    );
  }

  if (routineManager.inspectorTarget.type === "routineTag") {
    return (
      <RoutineTagInspector
        routineTagId={routineManager.inspectorTarget.id}
        isOpen
        onClose={routineManager.closeInspector}
      />
    );
  }

  return (
    <RoutineTaskInspector
      routineTaskId={routineManager.inspectorTarget.id}
      isOpen
      onClose={routineManager.closeInspector}
    />
  );
};

export default StationRoutineInspectorHost;
