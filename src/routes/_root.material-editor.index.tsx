import { createFileRoute } from "@tanstack/react-router";
import MaterialEditorPage from "@/pages/root/material-editor/MaterialEditorPage";

export const Route = createFileRoute("/_root/material-editor/")({
  component: MaterialEditorPage,
});
