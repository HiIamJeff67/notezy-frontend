import { createFileRoute, Outlet } from "@tanstack/react-router";
import BlockPackEditorNotFoundPage from "@/pages/root/block-pack-editor/BlockPackEditorNotFoundPage";
import BlockPackEditorLayout from "@/pages/root/block-pack-editor/BlockPackEditorShell";

export const Route = createFileRoute("/_root/block-pack-editor/$blockPackId")({
  component: BlockPackEditorRouteLayout,
  notFoundComponent: () => <BlockPackEditorNotFoundPage />,
});

function BlockPackEditorRouteLayout() {
  return (
    <BlockPackEditorLayout>
      <Outlet />
    </BlockPackEditorLayout>
  );
}
