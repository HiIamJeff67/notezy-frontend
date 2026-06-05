import { useContext } from "react";
import { RoutineContext } from "@/providers/RoutineProvider/RoutineProvider";

export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error("useRoutine must be used within RoutineProvider");
  }
  return context;
};
