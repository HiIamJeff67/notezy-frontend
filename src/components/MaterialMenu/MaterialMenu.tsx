import { useLanguage, useLoading, useShelfMaterial } from "@/hooks";
import {
  ShelfTreeSummary,
  SubShelfNode,
} from "@shared/types/shelfMaterialNodes";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";
import CheckIcon from "../icons/CheckIcon";
import { SidebarMenuItem } from "../ui/sidebar";
import MaterialMenuItem from "./MaterialMenuItem";
import MaterialMenuItemSkeleton from "./MaterialMenuItemSkeleton";

interface MaterialMenuProps {
  summary: ShelfTreeSummary;
  parent: SubShelfNode;
}

const MaterialMenu = ({ summary, parent }: MaterialMenuProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfMaterialManager = useShelfMaterial();

  const handleRenameMaterialOnSubmit = useCallback(async (): Promise<void> => {
    loadingManager.setIsLoading(true);
    try {
      await shelfMaterialManager.renameEditingMaterial();
    } catch (error) {
      toast.error(languageManager.tError(error));
    } finally {
      loadingManager.setIsLoading(false);
    }
  }, [loadingManager, languageManager, shelfMaterialManager]);

  return (
    <Suspense fallback={<MaterialMenuItemSkeleton />}>
      {Object.entries(parent.materialNodes).map(
        ([materialId, materialNode]) => {
          return (
            <Suspense fallback={<MaterialMenuItemSkeleton />} key={materialId}>
              {shelfMaterialManager.isMaterialNodeEditing(materialNode) ? (
                <SidebarMenuItem
                  key={materialId}
                  className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative"
                >
                  <input
                    ref={shelfMaterialManager.inputRef}
                    type="text"
                    value={shelfMaterialManager.editMaterialNodeName}
                    className="flex-1 bg-transparent w-full h-6 outline-none caret-foreground overflow-hidden"
                    onChange={e =>
                      shelfMaterialManager.setEditMaterialNodeName(
                        e.target.value
                      )
                    }
                    onKeyDown={async e => {
                      switch (e.key) {
                        case "Enter":
                          await handleRenameMaterialOnSubmit();
                        case "Escape":
                          shelfMaterialManager.cancelRenamingMaterialNode();
                      }
                    }}
                  />
                  {shelfMaterialManager.isNewMaterialNodeName() && (
                    <button
                      onClick={async e => {
                        await handleRenameMaterialOnSubmit();
                        e.stopPropagation();
                      }}
                      className="rounded hover:bg-primary/60 absolute w-4 h-4"
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <CheckIcon className="w-full h-full" />
                    </button>
                  )}
                </SidebarMenuItem>
              ) : (
                <MaterialMenuItem
                  key={materialId}
                  summary={summary}
                  root={summary.root}
                  parent={parent}
                  current={materialNode}
                />
              )}
            </Suspense>
          );
        }
      )}
    </Suspense>
  );
};

export default MaterialMenu;
