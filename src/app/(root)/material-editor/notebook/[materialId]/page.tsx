import NotebookEditor from "@/components/NotebookEditor/NotebookEditor";
import { getDefaultNotebookMaterialMeta } from "@shared/types/notebookMaterialMeta.type";
import { isValidUUID } from "@shared/types/uuid_v4.type";
import { Suspense } from "react";
import MaterialEditorNotFoundPage from "../../not-found";

interface MaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId?: string;
  }>;
}

const MaterialEditorPage = async ({
  params,
  searchParams,
}: MaterialEditorPageProps) => {
  const { materialId } = await params;
  const { parentSubShelfId } = await searchParams;
  if (
    !parentSubShelfId ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(materialId)
  )
    return <MaterialEditorNotFoundPage />;

  return (
    <Suspense fallback={<MaterialEditorNotFoundPage />}>
      <NotebookEditor
        defaultMeta={getDefaultNotebookMaterialMeta(
          materialId,
          parentSubShelfId
        )}
      />
    </Suspense>
  );
};

export default MaterialEditorPage;
