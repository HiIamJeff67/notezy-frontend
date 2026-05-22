import { createFileRoute } from "@tanstack/react-router";
import MaterialViewerIndexPage from "@/pages/root/material-viewer/MaterialViewerIndexPage";

export const Route = createFileRoute("/_root/material-viewer/")({
  component: MaterialViewerIndexPage,
});
