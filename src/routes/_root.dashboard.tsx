import { createFileRoute, Outlet } from "@tanstack/react-router";
import DashboardLayout from "@/pages/root/dashboard/DashboardShell";

export const Route = createFileRoute("/_root/dashboard")({
  component: DashboardRouteLayout,
});

function DashboardRouteLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
