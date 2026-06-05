import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { Suspense } from "react";
import BlockPackEditor from "@/components/core/BlockPackEditor/BlockPackEditor";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { BlockEditorProvider } from "@/providers/BlockEditorProvider";

interface BlockPackEditorPageProps {
  blockPackMeta: BlockPackMeta;
}

const BlockPackEditorPage = ({ blockPackMeta }: BlockPackEditorPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <BlockEditorProvider blockPackMeta={blockPackMeta}>
        <BlockPackEditor
          key={`${blockPackMeta.id}:${blockPackMeta.parentId}:${blockPackMeta.rootId}`}
          blockPackMeta={blockPackMeta}
        />
      </BlockEditorProvider>
    </Suspense>
  );
};

export default BlockPackEditorPage;
