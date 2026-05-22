import { createFileRoute } from "@tanstack/react-router";
import BlockPackEditorIndexPage from "@/pages/root/block-pack-editor/BlockPackEditorIndexPage";

export const Route = createFileRoute("/_root/block-pack-editor/")({
  component: BlockPackEditorIndexPage,
});
