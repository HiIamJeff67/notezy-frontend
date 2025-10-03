import { SidebarMenu } from "@/components/ui/sidebar";
import { useShelfMaterial } from "@/hooks";
import RootShelfMenuItem from "./RootShelfMenuItem";

const RootShelfMenu = () => {
  const shelfMaterialManager = useShelfMaterial();

  return (
    <SidebarMenu className="overflow-hidden">
      {shelfMaterialManager.rootShelfEdges.map((edge, index) => (
        <RootShelfMenuItem key={index} rootShelfEdge={edge} index={index} />
      ))}
    </SidebarMenu>
  );
};

export default RootShelfMenu;
