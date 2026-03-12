import RootShelfMenuItem from "@/components/RootShelfMenu/RootShelfMenuItem";
import RootShelfMenuItemSkeleton from "@/components/RootShelfMenu/RootShelfMenuItemSkeleton";
import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelfItem } from "@/hooks";
import { Suspense } from "react";

const RootShelfMenu = () => {
  const shelfItemManager = useShelfItem();

  return (
    <SidebarMenu className="overflow-hidden">
      <Suspense fallback={<RootShelfMenuItemSkeleton />}>
        {shelfItemManager.rootShelfEdges.map((edge, index) => (
          <Suspense fallback={<RootShelfMenuItemSkeleton />} key={index}>
            <RootShelfMenuItem key={index} rootShelfEdge={edge} index={index} />
          </Suspense>
        ))}
      </Suspense>
    </SidebarMenu>
  );
};

export default RootShelfMenu;
