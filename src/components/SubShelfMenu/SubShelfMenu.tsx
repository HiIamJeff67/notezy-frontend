import {
  RootShelfNode,
  ShelfTreeSummary,
} from "@shared/lib/shelfMaterialNodes";
import { SidebarMenu } from "../ui/sidebar";
import SubShelfMenuItem from "./SubShelfMenuItem";

interface SubShelfMenuProps {
  summary: ShelfTreeSummary;
  root: RootShelfNode;
}

const SubShelfMenu = ({ summary, root }: SubShelfMenuProps) => {
  return (
    <SidebarMenu>
      {Object.entries(root.children).map(
        ([subShelfId, subShelfNode]) =>
          subShelfNode && (
            <SubShelfMenuItem
              key={subShelfId}
              summary={summary}
              root={root}
              parent={null}
              current={subShelfNode}
              depth={0}
            />
          )
      )}
    </SidebarMenu>
  );
};

export default SubShelfMenu;
