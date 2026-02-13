import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelfItem } from "@/hooks";
import RootShelfMenuItem from "./RootShelfMenuItem";

const RootShelfMenu = () => {
  const shelfItemManager = useShelfItem();

  return (
    <SidebarMenu className="overflow-hidden">
      {shelfItemManager.rootShelfEdges.map((edge, index) => (
        <RootShelfMenuItem key={index} rootShelfEdge={edge} index={index} />
      ))}
    </SidebarMenu>
  );
};

export default RootShelfMenu;
