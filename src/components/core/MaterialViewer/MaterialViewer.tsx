import { MaterialMeta } from "@shared/types/materialMeta.type";
import { Suspense, useEffect, useReducer } from "react";
import StrictLoadingCover from "@/components/covers/LoadingCover/StrictLoadingCover";
import { useShelfItem } from "@/hooks";
import { materialMetaReducer } from "@/reducers/materialMeta.reducer";
import MaterialViewerContent from "./MaterialViewerContent";

interface MaterialViewerProps {
  materialMeta: MaterialMeta;
}

const MaterialViewer = ({ materialMeta }: MaterialViewerProps) => {
  const shelfItemManager = useShelfItem();

  const [meta, dispatchMeta] = useReducer(materialMetaReducer, materialMeta);

  useEffect(() => {
    if (shelfItemManager.isItemNodeEditing(meta.id)) {
      dispatchMeta({
        type: "setName",
        newName: shelfItemManager.editItemNodeName,
      });
    }
  }, [shelfItemManager.editItemNodeName]);

  return (
    <Suspense fallback={<StrictLoadingCover />}>
      <MaterialViewerContent meta={meta} dispatchMeta={dispatchMeta} />
    </Suspense>
  );
};

export default MaterialViewer;
