import { MaterialContentType } from "@shared/api/interfaces/enums";
import { MaterialMeta } from "@/reducers/materialMeta.reducer";
import MaterialViewerFrame from "./MaterialViewerFrame";

interface MaterialUnsupportedViewerContentProps {
  meta: MaterialMeta;
  materialContentType: MaterialContentType | undefined;
}

const MaterialUnsupportedViewerContent = ({
  meta,
  materialContentType,
}: MaterialUnsupportedViewerContentProps) => {
  return (
    <MaterialViewerFrame
      meta={meta}
      materialContentType={materialContentType}
      contentClassName="p-8 overflow-auto"
    >
      {meta.downloadURL && (
        <a
          href={meta.downloadURL}
          target="_blank"
          rel="noreferrer"
          className="underline text-primary"
        >
          Open file in new tab
        </a>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialUnsupportedViewerContent;
