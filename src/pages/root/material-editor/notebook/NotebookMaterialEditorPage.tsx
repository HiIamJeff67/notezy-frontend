import { getDefaultNotebookMaterialMeta } from "@shared/types/notebookMaterialMeta.type";
import type { UUID } from "crypto";
import { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import NotebookEditor from "@/components/editors/NotebookEditor/NotebookEditor";

interface NotebookMaterialEditorPageProps {
  materialId: UUID;
  parentSubShelfId: UUID;
  rootShelfId: UUID;
}

const NotebookMaterialEditorPage = ({
  materialId,
  parentSubShelfId,
  rootShelfId,
}: NotebookMaterialEditorPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <NotebookEditor
        notebookMaterialMeta={getDefaultNotebookMaterialMeta(
          materialId,
          parentSubShelfId,
          rootShelfId
        )}
      />
    </Suspense>
  );
};

export default NotebookMaterialEditorPage;
