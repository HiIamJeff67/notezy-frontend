import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const SubShelfMenuItemSkeleton = ({ number = 1 }: { number?: number }) => {
  return (
    <SidebarMenu>
      {Array.from({ length: number }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton className="rounded-sm animate-pulse">
            <Skeleton className="h-4 bg-gray-300 rounded w-3/4"></Skeleton>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SubShelfMenuItemSkeleton;
