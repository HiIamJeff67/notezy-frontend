"use client";

import { use } from "react";
import MaterialEditorContainer from "./container";

interface MaterialEditorPageProps {
  params: Promise<{
    materialId: string;
  }>;
}

const EditorPage = ({ params }: MaterialEditorPageProps) => {
  const { materialId } = use(params);

  return <MaterialEditorContainer materialId={materialId} />;
};

export default EditorPage;
