import { MaterialContentType } from "@shared/api/interfaces/enums";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          {t("workspace.viewer.openFileNewTab")}
        </a>
      )}
    </MaterialViewerFrame>
  );
};

export default MaterialUnsupportedViewerContent;
