import RoutineTagMenuItem from "@/components/menus/RoutineTagMenu/RoutineTagMenuItem";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useRoutine } from "@/hooks";

const RoutineTagMenu = () => {
  const routineManager = useRoutine();

  return (
    <SidebarMenu className="overflow-hidden">
      {routineManager.routineTags.map(routineTag => (
        <RoutineTagMenuItem key={routineTag.id} routineTag={routineTag} />
      ))}
    </SidebarMenu>
  );
};

export default RoutineTagMenu;
