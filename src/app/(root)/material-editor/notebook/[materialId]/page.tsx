import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import NotebookEditor from "@/components/NotebookEditor/NotebookEditor";
import { getDefaultNotebookMaterialMeta } from "@shared/types/notebookMaterialMeta.type";
import { isValidUUID } from "@shared/types/uuid_v4.type";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface NotebookMaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId?: string;
  }>;
}

const NotebookMaterialEditorPage = async ({
  params,
  searchParams,
}: NotebookMaterialEditorPageProps) => {
  const { materialId } = await params;
  const { parentSubShelfId } = await searchParams;
  if (
    !parentSubShelfId ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(materialId)
  )
    return notFound();

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <NotebookEditor
        defaultMeta={getDefaultNotebookMaterialMeta(
          materialId,
          parentSubShelfId
        )}
      />
    </Suspense>
  );
};

export default NotebookMaterialEditorPage;
