"use client";

import TextbookEditor from "@/components/Editor/TextbookEditor";
import { MaterialType } from "@shared/types/enums";
import { isValidUUID } from "@shared/types/uuid_v4.type";
import { UUID } from "crypto";
import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import MaterialEditorNotFoundPage from "./not-found";

interface MaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
}

const MaterialEditorPage = ({ params }: MaterialEditorPageProps) => {
  const { materialId } = use(params);
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as MaterialType) || undefined;
  if (!type || !isValidUUID(materialId)) return <MaterialEditorNotFoundPage />;

  let content: React.ReactNode;
  switch (type) {
    case MaterialType.Textbook:
      content = <TextbookEditor materialId={materialId as UUID} />;
      break;
    default:
      content = undefined;
  }

  return (
    <Suspense fallback={<MaterialEditorNotFoundPage />}>{content}</Suspense>
  );
};

export default MaterialEditorPage;
