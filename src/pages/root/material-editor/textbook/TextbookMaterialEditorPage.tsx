import type { UUID } from "crypto";
import { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import TextbookEditor from "@/components/editors/TextbookEditor/TextbookEditor";

interface TextbookMaterialEditorPageProps {
  materialId: UUID;
}

const TextbookMaterialEditorPage = ({
  materialId,
}: TextbookMaterialEditorPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <TextbookEditor materialId={materialId} />
    </Suspense>
  );
};

export default TextbookMaterialEditorPage;
