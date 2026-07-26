import { createFileRoute, Outlet } from "@tanstack/react-router";
import StationRoutineInspectorHost from "@/components/inspectors/StationRoutineInspectorHost";
import SettingsSheet from "@/components/sheets/SettingsSheet/SettingsSheet";
import { AppSidebar } from "@/components/sidebar/AppSidebar/AppSidebar";
import AppSidebarInset from "@/components/sidebar/AppSidebar/AppSidebarInset";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ModalProvider } from "@/providers/ModalProvider";
import { ResizeSidebarProvider } from "@/providers/ResizeSidebarProvider";
import { SettingsDisplayProvider } from "@/providers/SettingsDisplayProvider";
import { ShelfItemProvider } from "@/providers/ShelfItemProvider/ShelfItemProvider";
import { StationRoutineProvider } from "@/providers/StationRoutineProvider/StationRoutineProvider";

export const Route = createFileRoute("/_root")({
  component: RootRouteLayout,
});

function RootRouteLayout() {
  return (
    <SidebarProvider>
      <ResizeSidebarProvider>
        <ShelfItemProvider>
          <StationRoutineProvider>
            <ModalProvider>
              <SettingsDisplayProvider>
                <AppSidebar />
                <AppSidebarInset>
                  <Outlet />
                </AppSidebarInset>
                <SettingsSheet />
                <StationRoutineInspectorHost />
              </SettingsDisplayProvider>
            </ModalProvider>
          </StationRoutineProvider>
        </ShelfItemProvider>
      </ResizeSidebarProvider>
    </SidebarProvider>
  );
}
