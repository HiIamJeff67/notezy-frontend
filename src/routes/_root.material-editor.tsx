import { createFileRoute, Outlet } from "@tanstack/react-router";
import MaterialEditorNotFoundPage from "@/pages/root/material-editor/MaterialEditorNotFoundPage";
import MaterialEditorLayout from "@/pages/root/material-editor/MaterialEditorLayout";

export const Route = createFileRoute("/_root/material-editor")({
  component: MaterialEditorRouteLayout,
  notFoundComponent: () => <MaterialEditorNotFoundPage />,
});

function MaterialEditorRouteLayout() {
  return (
    <MaterialEditorLayout>
      <Outlet />
    </MaterialEditorLayout>
  );
}
