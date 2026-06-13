import { useContext } from "react";
import { StationRoutineContext } from "@/providers/StationRoutineProvider/StationRoutineProvider";

export const useRoutine = () => {
  const context = useContext(StationRoutineContext);
  if (!context) {
    throw new Error("useRoutine must be used within StationRoutineProvider");
  }
  return context;
};
