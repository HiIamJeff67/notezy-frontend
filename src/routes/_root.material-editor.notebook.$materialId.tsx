import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import NotebookMaterialEditorPage from "@/pages/root/material-editor/notebook/NotebookMaterialEditorPage";

export const Route = createFileRoute(
  "/_root/material-editor/notebook/$materialId"
)({
  validateSearch: search => ({
    parentSubShelfId:
      typeof search.parentSubShelfId === "string"
        ? search.parentSubShelfId
        : undefined,
    rootShelfId:
      typeof search.rootShelfId === "string" ? search.rootShelfId : undefined,
  }),
  component: NotebookEditorRoute,
});

function NotebookEditorRoute() {
  const { materialId } = Route.useParams();
  const { parentSubShelfId, rootShelfId } = Route.useSearch();

  if (
    !parentSubShelfId ||
    !rootShelfId ||
    !isValidUUID(materialId) ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(rootShelfId)
  ) {
    throw notFound();
  }

  return (
    <NotebookMaterialEditorPage
      materialId={materialId as UUID}
      parentSubShelfId={parentSubShelfId as UUID}
      rootShelfId={rootShelfId as UUID}
    />
  );
}
