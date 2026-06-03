import { createFileRoute, Outlet } from "@tanstack/react-router";
import RoutinesLayout from "@/pages/root/routines/RoutinesLayout";

export const Route = createFileRoute("/_root/routines")({
  component: RoutinesRouteLayout,
});

function RoutinesRouteLayout() {
  return (
    <RoutinesLayout>
      <Outlet />
    </RoutinesLayout>
  );
}
