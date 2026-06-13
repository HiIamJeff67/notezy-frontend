import { Suspense } from "react";
import StationMenuItem from "@/components/menus/StationMenu/StationMenuItem";
import StationMenuItemSkeleton from "@/components/menus/StationMenu/StationMenuItemSkeleton";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useRoutine } from "@/hooks";

const StationMenu = () => {
  const routineManager = useRoutine();

  return (
    <SidebarMenu className="overflow-hidden">
      <Suspense fallback={<StationMenuItemSkeleton />}>
        {routineManager.stations.map(station => (
          <Suspense fallback={<StationMenuItemSkeleton />} key={station.id}>
            <StationMenuItem station={station} />
          </Suspense>
        ))}
      </Suspense>
    </SidebarMenu>
  );
};

export default StationMenu;
