import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthRouteLayout,
});

function AuthRouteLayout() {
  return <Outlet />;
}
