import RoutineTagMenuItem from "@/components/menus/RoutineTagMenu/RoutineTagMenuItem";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useStationRoutine } from "@/hooks";

const RoutineTagMenu = () => {
  const stationRoutineManager = useStationRoutine();

  return (
    <SidebarMenu className="overflow-hidden">
      {stationRoutineManager.routineTags.map(routineTag => (
        <RoutineTagMenuItem key={routineTag.id} routineTag={routineTag} />
      ))}
    </SidebarMenu>
  );
};

export default RoutineTagMenu;
