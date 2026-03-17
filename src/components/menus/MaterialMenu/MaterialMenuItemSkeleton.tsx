import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const MaterialMenuItemSkeleton = ({ number = 1 }: { number?: number }) => {
  return (
    <>
      {Array.from({ length: number }).map((_, index) => (
        <SidebarMenuButton
          className="w-full rounded-sm bg-transparent cursor-default hover:bg-transparent"
          key={index}
        >
          <Skeleton className="h-4 w-full max-w-[120px] rounded" />
        </SidebarMenuButton>
      ))}
    </>
  );
};

export default MaterialMenuItemSkeleton;
