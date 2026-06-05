import { MaterialContentType } from "@shared/api/interfaces/enums";
import { MaterialMeta } from "@shared/types/materialMeta.type";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialAudioViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType;
}

const MaterialAudioViewerContent = ({
  meta,
  materialContentType,
}: MaterialAudioViewerContentProps) => {
  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {meta.downloadURL && (
        <audio src={meta.downloadURL} controls className="w-full" />
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialAudioViewerContent;
