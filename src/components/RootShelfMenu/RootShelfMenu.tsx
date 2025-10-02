import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelf } from "@/hooks";
import RootShelfMenuItem from "./RootShelfMenuItem";

const RootShelfMenu = () => {
  const shelfMaterialManager = useShelf();

  return (
    <SidebarMenu className="overflow-hidden">
      {shelfMaterialManager.rootShelfEdges.map((edge, index) => (
        <RootShelfMenuItem key={index} rootShelfEdge={edge} index={index} />
      ))}
    </SidebarMenu>
  );
};

export default RootShelfMenu;
