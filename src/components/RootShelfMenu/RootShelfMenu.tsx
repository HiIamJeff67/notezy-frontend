import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelf } from "@/hooks";
import RootShelfMenuItem from "./RootShelfMenuItem";

const RootShelfMenu = () => {
  const shelfManager = useShelf();

  return (
    <SidebarMenu className="overflow-hidden">
      {shelfManager.rootShelfEdges.map((edge, index) => (
        <RootShelfMenuItem key={index} rootShelfEdge={edge} index={index} />
      ))}
    </SidebarMenu>
  );
};

export default RootShelfMenu;
