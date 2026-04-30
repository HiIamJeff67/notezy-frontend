import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import BlockPackEditorPage from "@/pages/root/block-pack-editor/BlockPackEditorPage";

export const Route = createFileRoute("/_root/block-pack-editor/$blockPackId/")({
  validateSearch: search => ({
    parentSubShelfId:
      typeof search.parentSubShelfId === "string"
        ? search.parentSubShelfId
        : undefined,
    rootShelfId:
      typeof search.rootShelfId === "string" ? search.rootShelfId : undefined,
  }),
  component: BlockPackEditorIndexRoute,
});

function BlockPackEditorIndexRoute() {
  const { blockPackId } = Route.useParams();
  const { parentSubShelfId, rootShelfId } = Route.useSearch();

  if (
    !parentSubShelfId ||
    !rootShelfId ||
    !isValidUUID(blockPackId) ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(rootShelfId)
  ) {
    throw notFound();
  }

  return (
    <BlockPackEditorPage
      blockPackId={blockPackId as UUID}
      parentSubShelfId={parentSubShelfId as UUID}
      rootShelfId={rootShelfId as UUID}
    />
  );
}
