import { createFileRoute, Outlet } from "@tanstack/react-router";
import BlockPackEditorNotFoundPage from "@/pages/root/block-pack-editor/BlockPackEditorNotFoundPage";

export const Route = createFileRoute("/_root/block-pack-editor")({
  component: BlockPackEditorRouteLayout,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorRouteLayout() {
  return <Outlet />;
}
