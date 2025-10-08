"use client";

import NotebookEditor from "@/components/Editors/NotebookEditor";
import { MaterialType } from "@shared/types/enums";
import { isValidUUID } from "@shared/types/uuid_v4.type";
import { UUID } from "crypto";
import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import MaterialEditorNotFoundPage from "../not-found";

interface MaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
}

const MaterialEditorPage = ({ params }: MaterialEditorPageProps) => {
  const { materialId } = use(params);
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as MaterialType) || undefined;
  const parentSubShelfId =
    (searchParams.get("parentSubShelfId") as UUID) || undefined;
  if (!type || !parentSubShelfId || !isValidUUID(materialId))
    return <MaterialEditorNotFoundPage />;

  let content: React.ReactNode;
  switch (type) {
    case MaterialType.Notebook:
      content = (
        <NotebookEditor
          materialId={materialId as UUID}
          parentSubShelfId={parentSubShelfId}
        />
      );
      break;
    default:
      content = undefined;
  }

  return (
    <Suspense fallback={<MaterialEditorNotFoundPage />}>{content}</Suspense>
  );
};

export default MaterialEditorPage;
