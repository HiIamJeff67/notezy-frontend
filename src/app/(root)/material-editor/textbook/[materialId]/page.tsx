import StrictLoadingOutlay from "@/components/LoadingOutlay/StrictLoadingOutlay";
import TextbookEditor from "@/components/TextbookEditor/TextbookEditor";
import { isValidUUID } from "@shared/types/uuid_v4.type";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface TextbookMaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
  searchParams: Promise<{
    parentSubShelfId?: string;
  }>;
}

const TextbookMaterialEditorPage = async ({
  params,
  searchParams,
}: TextbookMaterialEditorPageProps) => {
  const { materialId } = await params;
  const { parentSubShelfId } = await searchParams;

  if (
    !parentSubShelfId ||
    !isValidUUID(parentSubShelfId) ||
    !isValidUUID(materialId)
  )
    return notFound();

  // we cannot fetch or load the material content here,
  // since the server component will not have the authorization tokens in cookie

  return (
    <Suspense fallback={<StrictLoadingOutlay />}>
      <TextbookEditor materialId={materialId} />
    </Suspense>
  );
};

export default TextbookMaterialEditorPage;
