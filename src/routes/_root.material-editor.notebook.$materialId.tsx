import { isValidUUID } from "@shared/types/uuidv4.type";
import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UUID } from "crypto";
import MaterialEditorNotFoundPage from "@/pages/root/material-editor/MaterialEditorNotFoundPage";
import NotebookMaterialEditorPage from "@/pages/root/material-editor/notebook/NotebookMaterialEditorPage";

export const Route = createFileRoute(
  "/_root/material-editor/notebook/$materialId"
)({
  ssr: false,
  validateSearch: search => ({
    parentSubShelfId:
      typeof search.parentSubShelfId === "string"
        ? search.parentSubShelfId
        : undefined,
    rootShelfId:
      typeof search.rootShelfId === "string" ? search.rootShelfId : undefined,
  }),
  loaderDeps: ({ search }) => {
    const { parentSubShelfId, rootShelfId } = search;

    if (
      !parentSubShelfId ||
      !rootShelfId ||
      !isValidUUID(parentSubShelfId) ||
      !isValidUUID(rootShelfId)
    ) {
      throw notFound();
    }

    return {
      parentSubShelfId: parentSubShelfId as UUID,
      rootShelfId: rootShelfId as UUID,
    };
  },
  loader: async ({ params, deps }) => {},
  component: NotebookEditorRoute,
  notFoundComponent: () => <MaterialEditorNotFoundPage />,
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
