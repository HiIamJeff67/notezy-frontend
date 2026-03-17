import CheckIcon from "@/components/icons/CheckIcon";
import MaterialMenuItem from "@/components/menus/MaterialMenu/MaterialMenuItem";
import MaterialMenuItemSkeleton from "@/components/menus/MaterialMenu/MaterialMenuItemSkeleton";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { useLanguage, useLoading, useShelfItem } from "@/hooks";
import { MaterialType } from "@shared/enums";
import { SubShelfNode } from "@shared/types/shelfNodes.type";
import { Suspense, useCallback } from "react";
import toast from "react-hot-toast";

interface MaterialMenuProps {
  parent: SubShelfNode;
}

const MaterialMenu = ({ parent }: MaterialMenuProps) => {
  const loadingManager = useLoading();
  const languageManager = useLanguage();
  const shelfItemManager = useShelfItem();

  const handleRenameMaterialOnSubmit = useCallback(
    async (materialType: MaterialType) =>
      await loadingManager.startAsyncTransactionLoading(
        async () =>
          await shelfItemManager
            .renameEditingMaterial(materialType)
            .catch(error => toast.error(languageManager.tError(error)))
      ),
    [loadingManager, languageManager, shelfItemManager]
  );

  return (
    <Suspense fallback={<MaterialMenuItemSkeleton />}>
      {Object.entries(parent.materialNodes).map(
        ([materialId, materialNode]) => {
          return (
            <Suspense fallback={<MaterialMenuItemSkeleton />} key={materialId}>
              {shelfItemManager.isItemNodeEditing(materialNode.id) ? (
                <SidebarMenuItem
                  key={materialId}
                  className="flex items-center justify-end rounded-sm px-2 py-1 bg-muted border-1 border-foreground relative"
                >
                  <input
                    ref={shelfItemManager.inputRef}
                    type="text"
                    value={shelfItemManager.editItemNodeName}
                    className="flex-1 bg-transparent w-full h-6 outline-none overflow-hidden"
                    onChange={e =>
                      shelfItemManager.setEditItemNodeName(e.target.value)
                    }
                    onKeyDown={async e => {
                      switch (e.key) {
                        case "Enter":
                          await handleRenameMaterialOnSubmit(materialNode.type);
                        case "Escape":
                          shelfItemManager.cancelRenamingItemNode();
                      }
                    }}
                  />
                  {shelfItemManager.isNewItemNodeName() && (
                    <button
                      onClick={async e => {
                        await handleRenameMaterialOnSubmit(materialNode.type);
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
