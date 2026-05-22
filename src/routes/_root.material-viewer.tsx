import { createFileRoute, Outlet } from "@tanstack/react-router";
import MaterialViewerNotFoundPage from "@/pages/root/material-viewer/MaterialViewerNotFoundPage";

export const Route = createFileRoute("/_root/material-viewer")({
  component: MaterialViewerRouteLayout,
  notFoundComponent: () => <MaterialViewerNotFoundPage />,
});

function MaterialViewerRouteLayout() {
  return <Outlet />;
}
