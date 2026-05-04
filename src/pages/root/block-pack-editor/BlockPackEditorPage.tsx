import { BlockPackMeta } from "@shared/types/blockPackMeta.type";
import { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import BlockPackEditor from "@/components/editors/BlockPackEditor/BlockPackEditor";

interface BlockPackEditorPageProps {
  blockPackMeta: BlockPackMeta;
}

const BlockPackEditorPage = ({ blockPackMeta }: BlockPackEditorPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <BlockPackEditor
        key={`${blockPackMeta.id}:${blockPackMeta.parentId}:${blockPackMeta.rootId}`}
        blockPackMeta={blockPackMeta}
      />
    </Suspense>
  );
};

export default BlockPackEditorPage;
