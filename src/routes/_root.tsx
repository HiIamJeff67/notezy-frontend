import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/sidebar/AppSidebar/AppSidebar";
import AppSidebarInset from "@/components/sidebar/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";
import { ShelfItemProvider } from "@/providers/ShelfItemProvider/ShelfItemProvider";

export const Route = createFileRoute("/_root")({
  component: RootRouteLayout,
});

function RootRouteLayout() {
  return (
    <SidebarProvider>
      <ResizeSidebarProvider>
        <ShelfItemProvider>
          <AppSidebar />
          <AppSidebarInset>
            <Outlet />
          </AppSidebarInset>
        </ShelfItemProvider>
      </ResizeSidebarProvider>
    </SidebarProvider>
  );
}
