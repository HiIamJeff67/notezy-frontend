import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import TextbookMaterialEditorPage from "@/pages/root/material-editor/textbook/TextbookMaterialEditorPage";

export const Route = createFileRoute(
  "/_root/material-editor/textbook/$materialId"
)({
  validateSearch: search => ({
    parentSubShelfId:
      typeof search.parentSubShelfId === "string"
        ? search.parentSubShelfId
        : undefined,
  }),
  component: TextbookEditorRoute,
});

function TextbookEditorRoute() {
  const { materialId } = Route.useParams();
  const { parentSubShelfId } = Route.useSearch();

  if (
    !parentSubShelfId ||
    !isValidUUID(materialId) ||
    !isValidUUID(parentSubShelfId)
  ) {
    throw notFound();
  }

  return <TextbookMaterialEditorPage materialId={materialId as UUID} />;
}
