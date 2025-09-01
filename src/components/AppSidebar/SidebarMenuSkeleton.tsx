import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const ShelfMenuSkeleton = () => {
  return (
    <SidebarMenu>
      {Array.from({ length: 4 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton className="rounded-sm animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default ShelfMenuSkeleton;
