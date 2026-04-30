import { getDefaultBlockPackMeta } from "@shared/types/blockPackMeta.type";
import type { UUID } from "crypto";
import { Suspense } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import BlockPackEditor from "@/components/editors/BlockPackEditor/BlockPackEditor";

interface BlockPackEditorPageProps {
  blockPackId: UUID;
  parentSubShelfId: UUID;
  rootShelfId: UUID;
}

const BlockPackEditorPage = ({
  blockPackId,
  parentSubShelfId,
  rootShelfId,
}: BlockPackEditorPageProps) => {
  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <BlockPackEditor
        key={`${blockPackId}:${parentSubShelfId}:${rootShelfId}`}
        defaultBlockPackMeta={getDefaultBlockPackMeta(
          blockPackId,
          parentSubShelfId,
          rootShelfId
        )}
      />
    </Suspense>
  );
};

export default BlockPackEditorPage;
